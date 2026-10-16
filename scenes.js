// Scene list. Each `say` entry is one voice-over clip; c.p(k) eases in when clip k starts.
// Facts follow https://www.superlogical.com/rex/docs (read October 2026).

// Visible while clip `from` has started and clip `to` hasn't (crossfades between views).
const span = (c, from, to = null) => c.p(from, 0, 0.45) * (to == null ? 1 : 1 - c.p(to, -0.35, 0.35));

const SCENES = [
  // 1 ─ Intro
  {
    chapter: 'WELCOME',
    say: [
      'Welcome to Rex: the multiplexer for all work.',
      "In the next few minutes, you'll learn the core ideas, the everyday moves, and how to automate almost anything.",
      'No terminal experience needed. We start from zero.',
    ],
    render: c => [
      title('REX', { y: 80, size: 280, p: c.p(0) }),
      textAt(960, 400, 'THE MULTIPLEXER FOR ALL WORK', { size: 64, color: C.green, align: 'center', font: 'hl', p: c.p(0, 0.5) }),
      blob({ x: 860, y: 520, s: 1, t: c.t, p: c.p(0, 0.9, 0.7), mood: c.seg >= 2 ? 'wink' : 'happy' }),
      at(960, 800, `<div style="display:flex;gap:28px">${['CORE IDEAS', 'EVERYDAY MOVES', 'AUTOMATION'].map((s, i) =>
        `<span style="opacity:${c.p(1, 0.5 + i * 0.5)}">${pill(s, [C.yellow, C.blue, C.green][i], { size: 36 })}</span>`).join('')}</div>`, { align: 'center', p: c.p(1) }),
      textAt(960, 920, 'START FROM ZERO &rarr;', { size: 52, font: 'hl', color: C.cream, align: 'center', p: c.p(2, 0.3) }),
    ].join(''),
  },

  // 2 ─ What's a terminal
  {
    chapter: 'TERMINALS',
    say: [
      "First: a terminal. It's a window where you type commands, and programs answer back in text.",
      'Your shell runs there. So do editors, build tools, test runners, servers, and these days, coding agents.',
      'A terminal usually runs one main program at a time. Keep that in mind.',
    ],
    render: c => {
      const lines = [];
      const a = c.typed('ls', 0, 1.2, 8), b = c.typed('git status', 0, 2.6, 12);
      lines.push(sh(a + (c.t < c.st(0) + 2.5 ? cur(c.t) : '')));
      if (c.on(0, 1.9)) lines.push({ t: 'docs   src   README.md', c: C.blue });
      if (c.on(0, 2.5)) lines.push(sh(b + (c.on(0, 4) ? '' : cur(c.t))));
      if (c.on(0, 4)) lines.push({ t: 'On branch main', c: C.cream }, { t: 'nothing to commit, working tree clean', c: C.muted });
      if (c.on(0, 4.4)) lines.push(sh(cur(c.t)));
      const chips = ['shell', 'editor', 'build', 'tests', 'server', 'agent'];
      return [
        title(`WHAT'S A <span class="g">TERMINAL</span>?`, { p: c.p(0) }),
        term({ x: 300, y: 230, w: 1100, h: 520, name: 'zsh', lines, p: c.p(0, 0.3), fs: 34 }),
        at(960, 800, `<div style="display:flex;gap:22px">${chips.map((s, i) => `<span style="display:inline-block;opacity:${c.p(1, 0.4 + i * 0.35)};transform:scale(${easeBack(c.p(1, 0.4 + i * 0.35))})">${pill(s, i === 5 ? C.green : C.cream, { size: 34 })}</span>`).join('')}</div>`, { align: 'center' }),
        textAt(960, 930, '1 terminal &asymp; 1 program at a time', { size: 44, color: C.yellow, align: 'center', font: 'mono', p: c.p(2, 0.4) }),
        blob({ x: 1470, y: 470, s: 0.95, t: c.t, p: c.p(0, 1), look: -1 }),
      ].join('');
    },
  },

  // 3 ─ The problem
  {
    chapter: 'THE PROBLEM',
    say: [
      'But real work needs many of them at once: an editor, a dev server, tests, logs, an agent or two.',
      'So you open window after window, and quickly lose track of which one is which.',
      'Close the laptop, or drop the connection, and that whole setup can be gone.',
    ],
    render: c => {
      const wins = [
        ['editor', 120, 250, -4], ['dev server', 560, 330, 3], ['tests', 1010, 240, -2],
        ['logs', 1380, 360, 5], ['agent', 300, 560, 2], ['agent 2', 820, 610, -5], ['psql', 1250, 640, 3],
      ];
      const chaos = c.p(1, 0, 1.2), gone = c.p(2, 0.8, 0.8);
      return [
        title(`TOO MANY <span class="r">TERMINALS</span>`, { p: c.p(0) }),
        ...wins.map(([n, x, y, r], i) => {
          const jx = Math.sin(c.t * 2.2 + i * 1.7) * 26 * chaos, jy = Math.cos(c.t * 1.8 + i) * 18 * chaos;
          return at(x + jx, y + jy + gone * 120, `<div style="opacity:${1 - gone * 0.75}">${term({ x: 0, y: 0, w: 420, h: 250, name: n, color: gone > 0.5 ? C.red : C.cream, lines: [{ t: bars(3), c: C.line }], fs: 20 })}</div>`, { p: c.p(0, 0.5 + i * 0.45), pop: true, rot: r + Math.sin(c.t + i) * 2 * chaos });
        }),
        ...[[480, 280], [1180, 560], [860, 470]].map(([x, y], i) => textAt(x, y, '?', { size: 140, font: 'hl', color: C.yellow, p: c.p(1, 0.6 + i * 0.4) * (1 - gone) })),
        badge(885, 480, false, { p: c.p(2, 1.2), size: 170, z: 9 }),
        textAt(960, 950, 'CONNECTION LOST', { size: 56, font: 'hl', color: C.red, align: 'center', p: c.p(2, 1.4) }),
        blob({ x: 1640, y: 820, s: 0.8, mood: 'sad', t: c.t, p: c.p(1, 1.2), z: 10 }),
      ].join('');
    },
  },

  // 4 ─ Terminal multiplexer
  {
    chapter: 'MULTIPLEXERS',
    say: [
      'A terminal multiplexer fixes this.',
      "It's one program that holds many terminals, arranged as tabs and side by side panes.",
      'And because those terminals live in a background server, they keep running even when nothing is looking at them. Walk away, come back, and everything is exactly where you left it.',
      "If you've used tee-mux before, this will feel familiar.",
    ],
    render: c => {
      const away = c.p(2, 2.2, 0.6) * (1 - c.p(2, 6.5, 0.6));
      const panes = [
        { x: 0, y: 0, w: 0.58, h: 1, label: 'editor', color: C.green, content: bars(7, C.line), o: c.p(1, 0.6) },
        { x: 0.58, y: 0, w: 0.42, h: 0.5, label: 'server', color: C.blue, content: `<div style="font-size:24px;color:${C.blue}">${spinner(c.t, 30)} running</div>`, o: c.p(1, 1.2) },
        { x: 0.58, y: 0.5, w: 0.42, h: 0.5, label: 'tests', color: C.yellow, content: `<div style="font-size:24px;color:${C.yellow}">${spinner(c.t * 1.3, 30, C.yellow)} watching</div>`, o: c.p(1, 1.8) },
      ];
      return [
        title(`TERMINAL <span class="g">MULTIPLEXER</span>`, { p: c.p(0) }),
        `<div style="opacity:${1 - away * 0.7}">`,
        miniWin({ x: 310, y: 230, w: 1300, h: 620, p: c.p(0, 0.3), color: C.green, tabs: c.on(1, 0.2) ? [{ label: 'dev', active: true, color: C.green }, { label: 'db' }, { label: 'agent' }] : null, panes }),
        `</div>`,
        textAt(960, 470, 'NOBODY WATCHING &middot; STILL RUNNING', { size: 64, font: 'hl', color: C.cream, align: 'center', p: away }),
        textAt(960, 548, 'zzz', { size: 46, font: 'mono', color: C.muted, align: 'center', p: away }),
        badge(1530, 170, true, { p: c.p(2, 6.8), size: 130, z: 9 }),
        textAt(960, 900, 'RIGHT WHERE YOU LEFT IT', { size: 54, font: 'hl', color: C.green, align: 'center', p: c.p(2, 7) * (1 - c.p(3, -0.2, 0.3)) }),
        at(960, 890, `${pill('tmux', C.yellow, { size: 40 })}<span class="body" style="font-size:40px;color:${C.cream};margin-left:20px">same idea, familiar feel</span>`, { align: 'center', p: c.p(3, 0.2) }),
        blob({ x: 90, y: 820, s: 0.8, t: c.t, p: c.p(3, 0.4), mood: 'wink' }),
      ].join('');
    },
  },

  // 5 ─ Server + clients
  {
    chapter: 'SERVER + CLIENTS',
    say: [
      'Rex is built on that idea: a server, and clients.',
      'The server runs your terminals and keeps your sessions alive.',
      "Clients connect to it to show and control them. Today, that's the Mac app, with clients for iOS, Linux and Windows on the way.",
      'The Mac app ships with its own local server, so you just install it and go.',
    ],
    render: c => {
      const sess = ['api', 'website', 'research'];
      const clients = [['Mac app', C.cream, false, 'BETA'], ['iOS', C.muted, true, 'SOON'], ['Linux', C.muted, true, 'SOON'], ['Windows', C.muted, true, 'SOON']];
      const sx = 760, sy = 540;
      return [
        title(`<span class="g">SERVER</span> + CLIENTS`, { p: c.p(0) }),
        box(220, 360, 540, 360, { color: C.green, label: 'REX SERVER', p: c.p(1), pop: true, inner:
          `<div style="padding:70px 34px 0">${sess.map((s, i) => `<div class="mono" style="font-size:32px;color:${C.cream};margin:14px 0;opacity:${c.p(1, 0.5 + i * 0.3)}">${icon('dot', C.green, 26)} session: ${s}</div>`).join('')}</div>` }),
        textAt(490, 760, 'keeps sessions running', { size: 34, color: C.muted, align: 'center', p: c.p(1, 1.4) }),
        svg(clients.map((cl, i) => arrow(sx + 20, sy, 1170, 270 + i * 175 + 45, { color: cl[2] ? C.muted : C.cream, dash: cl[2], p: c.p(2, 0.2 + i * 0.5, 0.6) })).join('')),
        ...clients.map((cl, i) => box(1190, 250 + i * 175, 480, 110, { color: cl[1], dash: cl[2], p: c.p(2, 0.4 + i * 0.5), inner:
          `<div style="display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 30px"><span class="body" style="font-size:40px;font-weight:700;color:${cl[1]}">${cl[0]}</span>${pill(cl[3], i ? C.muted : C.yellow, { size: 22 })}</div>` })),
        badge(1610, 200, true, { p: c.p(3, 0.3), size: 110, z: 9 }),
        textAt(960, 950, 'built-in local server &rarr; install &amp; go', { size: 42, color: C.green, align: 'center', font: 'mono', p: c.p(3, 0.6) }),
      ].join('');
    },
  },

  // 6 ─ Taxonomy
  {
    chapter: 'THE MODEL',
    say: [
      'Rex organizes work into four kinds of things.',
      'A session is a group of related work, like one project.',
      'A window is a tab inside a session. It holds a layout.',
      "A block is one application in that layout. Today, that's a terminal, shown as a pane.",
      'And a client is any program connected to the server, like the app itself.',
      'Each one gets a permanent ID, and you can give it a friendly label, like api, or logs.',
    ],
    render: c => {
      const tabs = ['dev', 'db', 'agent'];
      const blk = (x, y, w, h, n, i) => box(x, y, w, h, { color: C.green, p: c.p(3, 0.3 + i * 0.3), r: 14, inner:
        `<div class="mono" style="padding:16px 20px;font-size:26px;color:${C.green}">${n}</div><div style="padding:0 20px">${bars(3)}</div>` });
      return [
        title(`THE FOUR <span class="y">BUILDING BLOCKS</span>`, { p: c.p(0) }),
        box(110, 230, 1280, 760, { color: C.yellow, label: 'SESSION &middot; api', p: c.p(1), lw: 6 }),
        at(160, 300, `<div style="display:flex;gap:14px">${tabs.map((tb, i) => `<div class="mtab" style="font-size:28px;${i === 0 ? `border-color:${C.blue};color:${C.blue};background:${C.panel2}` : ''}">${tb}</div>`).join('')}</div>`, { p: c.p(2) }),
        box(150, 370, 1200, 580, { color: C.blue, label: 'WINDOW &middot; dev', p: c.p(2, 0.3) }),
        blk(190, 440, 640, 470, 'block &middot; nvim', 0),
        blk(860, 440, 450, 225, 'block &middot; server', 1),
        blk(860, 685, 450, 225, 'block &middot; logs', 2),
        svg(arrow(1640, 470, 1405, 470, { color: C.red, p: c.p(4, 0.4) })),
        box(1450, 320, 400, 140, { color: C.red, label: 'CLIENT', p: c.p(4), inner:
          `<div class="body" style="padding:50px 26px 0;font-size:36px;font-weight:700;color:${C.cream}">Rex Mac app</div>` }),
        at(1450, 600, `<div class="mono" style="font-size:24px;color:${C.muted};line-height:1.6">id<br><span style="color:${C.cream}">block:01a10d99-<br>0c06-7795-bf67-…</span></div>`, { p: c.p(5, 0.2) }),
        at(1450, 790, `<div class="mono" style="font-size:24px;color:${C.muted};line-height:1.6">label<br></div>${pill('logs', C.green, { size: 34, fill: true })}`, { p: c.p(5, 1.6) }),
        textAt(1630, 730, '+', { size: 50, font: 'hl', color: C.cream, p: c.p(5, 1.2) }),
      ].join('');
    },
  },

  // 7 ─ Command palette & actions
  {
    chapter: 'EVERYDAY MOVES',
    say: [
      'Inside the app, the command palette is home base. Press Command, Shift, P, and search for anything Rex can do.',
      'Split a pane, zoom it to fill the window, open a new tab, or switch sessions.',
      'Every one of these is an action. Actions can be bound to keys, run from the palette, or called from the command line.',
    ],
    render: c => {
      const items = ['Split Pane', 'Zoom Pane', 'New Tab', 'Change Session…', 'Install Rex for Agents'];
      const sel = c.seg >= 1 ? Math.min(3, Math.floor((c.t - c.st(1)) / 1.1)) : 0;
      const pal = span(c, 0, 2);
      const q = '';
      const rows = items.map((s, i) => `<div class="body" style="font-size:36px;padding:14px 26px;border-radius:12px;margin:4px 0;${i === sel ? `background:${C.green};color:${C.bg};font-weight:700` : `color:${C.cream}`}">${s}</div>`).join('');
      const dest = [['KEY', C.yellow, keys(['⌘', 'D'])], ['PALETTE', C.green, `<span class="body" style="font-size:30px;color:${C.cream}">“Split Pane”</span>`], ['CLI', C.blue, `<span class="mono" style="font-size:30px;color:${C.cream}">rex do pane.split</span>`]];
      return [
        title(`THE <span class="g">COMMAND PALETTE</span>`, { p: c.p(0) }),
        `<div style="opacity:${pal}">`,
        at(960, 210, keys(['⌘', '⇧', 'P'], { lit: c.on(0, 2.2) && !c.on(0, 3), color: C.green }), { align: 'center', p: c.p(0, 0.5) }),
        at(460, 330, `<div style="width:1000px;border:5px solid ${C.cream};border-radius:22px;background:${C.panel};padding:22px">
          <div class="mono" style="font-size:38px;padding:14px 22px;border-bottom:3px solid ${C.line};margin-bottom:12px;color:${C.cream}"><span style="color:${C.muted}">&gt;</span> ${esc(q)}${cur(c.t)}</div>${rows}</div>`, { p: c.p(0, 2.6), pop: true }),
        `</div>`,
        box(760, 300, 400, 130, { color: C.cream, p: c.p(2, 0.2), pop: true, inner: `<div class="mono" style="text-align:center;padding-top:34px;font-size:40px;color:${C.cream}">pane.split</div>`, label: 'ACTION' }),
        svg(dest.map((d, i) => arrow(960, 440, 380 + i * 580, 640, { color: d[1], p: c.p(2, 0.8 + i * 0.6, 0.5) })).join('')),
        ...dest.map((d, i) => box(380 + i * 580 - 240, 660, 480, 200, { color: d[1], label: d[0], p: c.p(2, 1 + i * 0.6), inner: `<div style="display:flex;align-items:center;justify-content:center;height:100%">${d[2]}</div>` })),
      ].join('');
    },
  },

  // 8 ─ The CLI
  {
    chapter: 'THE CLI',
    say: [
      'Which brings us to the rex command.',
      'Every terminal in Rex has it on its path, and it already knows which session and block you are in.',
      'rex ls lists your sessions. rex split splits the terminal you typed it in. And rex run opens a new window running a command.',
      "rex send types into another terminal, and rex capture reads what's on its screen.",
      'To act somewhere else, add a target: dash s for a session, dash w for a window, dash b for a block. Use an ID, a label, or a position.',
      'And add dash dash jason whenever a script needs to read the output.',
    ],
    render: c => {
      const L = [];
      const step = (k, d, cmd, out = []) => { if (c.on(k, d)) { L.push(sh(cmd)); out.forEach(o => L.push(o)); } };
      step(1, 1.5, 'echo $REX_SESSION', [{ t: 'session:01a10cf3-2655-…-12bef5', c: C.muted }]);
      step(2, 0.3, 'rex ls', [{ t: 'Research', c: C.cream }, { t: 'SL Website', c: C.cream }]);
      step(2, 2.6, 'rex split');
      step(2, 4.6, 'rex run -- htop');
      step(3, 0.3, "rex send -b logs 'make test'");
      step(3, 2.4, 'rex capture -b logs --trim', [{ t: 'hello from logs', c: C.cream }]);
      step(4, 1.0, "rex send -s build -w 2 'make test'");
      step(5, 0.4, 'rex ls --json', [{ t: '{ "sessions": [ { "session_id":', c: C.yellow }, { t: '  "session:01a1…", "label": "Research" } ] }', c: C.yellow }]);
      L.push(sh(cur(c.t)));
      const card = (k, k2, html) => at(1240, 250, html, { p: span(c, k, k2) });
      const envRow = (n, v) => `<div class="mono" style="font-size:28px;margin:18px 0"><span style="color:${C.yellow}">${n}</span><br><span style="color:${C.muted}">${v}</span></div>`;
      return [
        title(`THE <span class="mono y" style="text-transform:none">rex</span> COMMAND`, { p: c.p(0) }),
        term({ x: 100, y: 230, w: 1080, h: 760, name: 'zsh — api', lines: L, maxLines: 16, p: c.p(0, 0.3), fs: 29 }),
        card(1, 2, `<div class="hl" style="font-size:54px;color:${C.green}">KNOWS WHERE YOU ARE</div>${envRow('REX_SESSION', 'the session you are in')}${envRow('REX_BLOCK', 'the terminal you are typing in')}${envRow('REX_SERVER', 'the server running it')}`),
        card(2, 3, `<div class="hl" style="font-size:54px;color:${C.green}">BUILD LAYOUTS</div>` + miniWin({ x: 0, y: 110, w: 580, h: 380, panes: [
          { x: 0, y: 0, w: c.on(2, 2.8) ? 0.5 : 1, h: 1, label: 'zsh', color: C.green },
          ...(c.on(2, 2.8) ? [{ x: 0.5, y: 0, w: 0.5, h: 1, label: 'zsh', color: C.blue, o: c.p(2, 2.8) }] : [])],
          tabs: [{ label: '1', active: !c.on(2, 4.8), color: C.green }, ...(c.on(2, 4.8) ? [{ label: 'htop', active: true, color: C.yellow }] : [])] })),
        card(3, 4, `<div class="hl" style="font-size:54px;color:${C.green}">TYPE &amp; READ</div><div style="margin-top:40px">${pill('rex send', C.yellow, { size: 40 })}<div class="body" style="font-size:34px;color:${C.cream};margin:14px 0 40px">types into a terminal</div>${pill('rex capture', C.blue, { size: 40 })}<div class="body" style="font-size:34px;color:${C.cream};margin-top:14px">prints its screen</div></div>`),
        card(4, 5, `<div class="hl" style="font-size:54px;color:${C.green}">TARGETS</div>
          <div class="mono" style="font-size:34px;line-height:1.9;margin-top:24px"><span class="y">-s</span> session<br><span class="y">-w</span> window<br><span class="y">-b</span> block<br><span class="y">-C</span> client &nbsp;<span class="y">-S</span> server</div>
          <div class="body" style="font-size:30px;color:${C.muted};margin-top:24px">by ID &middot; label &middot; position &middot; short ID</div>`),
        card(5, null, `<div class="hl" style="font-size:54px;color:${C.green}">FOR SCRIPTS</div><div style="margin-top:40px">${pill('--json', C.yellow, { size: 52, fill: true })}</div><div class="body" style="font-size:34px;color:${C.cream};margin-top:30px;line-height:1.4">stable output<br>with full IDs</div>`),
      ].join('');
    },
  },

  // 9 ─ Configuration
  {
    chapter: 'CONFIGURATION',
    say: [
      'Rex works with zero configuration. When you want to change something, create one Lua file: init dot lua, in the rex folder inside your config directory.',
      'rex dot bind connects a key to an action. Here, Command D splits the pane to the right.',
      'Run rex config reload, and connected clients pick it up immediately.',
      'rex config check catches mistakes before you reload, and rex keymap shows what the server actually loaded.',
      'One rule to remember: shortcuts set in the app beat your file, and your file beats the defaults.',
    ],
    render: c => {
      const T = [];
      if (c.on(2, 0.2)) T.push(sh('rex config reload'));
      if (c.on(3, 0.2)) T.push(sh('rex config check'), { t: 'path: ~/.config/rex/init.lua', c: C.muted }, { t: 'bindings: 1   modes: 0   actions: 0', c: C.muted });
      if (c.on(3, 3)) T.push(sh('rex keymap'), { t: 'KEY    ACTION      ARGS                 SOURCE', c: C.muted }, { t: 'cmd+d  pane.split  {"direction":"right"} init.lua:1', c: C.cream });
      const split = c.on(1, 2.6) ? c.p(1, 2.6) : 0;
      const right = span(c, 1, 4);
      const stack = [['SET IN THE APP', C.green, 'wins'], ['init.lua', C.yellow, ''], ['CLIENT DEFAULTS', C.muted, '']];
      return [
        title(`CONFIGURE WITH <span class="b">LUA</span>`, { p: c.p(0) }),
        at(960, 200, pill('~/.config/rex/init.lua', C.blue, { size: 40 }), { align: 'center', p: c.p(0, 2.5) }),
        textAt(960, 290, 'optional &mdash; start without it', { size: 34, color: C.muted, align: 'center', p: c.p(0, 1.2) * (1 - c.p(1)) }),
        code({ x: 120, y: 330, w: 1060, src: 'rex.bind("cmd+d", "pane.split", { direction = "right" })', p: c.p(1), fs: 27 }),
        term({ x: 120, y: 540, w: 1060, h: 420, name: 'zsh', lines: T.length ? T : [sh(cur(c.t))], p: c.p(2), fs: 26 }),
        `<div style="opacity:${right}">`,
        at(1500, 330, keys(['⌘', 'D'], { lit: c.on(1, 2.2) && !c.on(1, 2.8), color: C.green }), { align: 'center', p: c.p(1, 1) }),
        miniWin({ x: 1240, y: 440, w: 520, h: 340, panes: [{ x: 0, y: 0, w: 1 - split * 0.5, h: 1, color: C.green }, ...(split ? [{ x: 0.5, y: 0, w: 0.5, h: 1, color: C.blue, o: split }] : [])], p: c.p(1, 0.6) }),
        badge(1690, 380, true, { p: c.p(2, 1), size: 110, z: 9 }),
        textAt(1500, 820, 'live in every client', { size: 34, color: C.green, align: 'center', p: c.p(2, 1.2) }),
        `</div>`,
        ...stack.map((s, i) => box(1240, 340 + i * 170, 560, 140, { color: s[1], p: c.p(4, 0.5 + (2 - i) * 0.5), inner:
          `<div style="display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 30px"><span class="hl" style="font-size:44px;color:${s[1]}">${s[0]}</span>${s[2] ? pill(s[2], C.green, { fill: true, size: 26 }) : ''}</div>` })),
        textAt(1260, 860, '&uarr; higher priority', { size: 30, color: C.muted, p: c.p(4, 2) }),
      ].join('');
    },
  },

  // 10 ─ Sequences & modes
  {
    chapter: 'SEQUENCES & MODES',
    say: [
      'Shortcuts can also be sequences: keys pressed one after another, joined with a greater than sign.',
      'Control B, then C, opens a new tab, just like tee-mux. Press Escape to cancel halfway.',
      'Modes go further. Press Command R to enter a resize mode, and the arrow keys now resize panes.',
      "Press Escape, and the arrows go back to normal. Make the mode exclusive, and you can't type into a terminal by accident.",
    ],
    render: c => {
      const A = span(c, 0, 2), B = c.p(2, 0, 0.45);
      const k1 = c.on(1, 0.2) && !c.on(1, 1.2), k2 = c.on(1, 1.2) && !c.on(1, 2.2);
      const newTab = c.on(1, 1.4);
      const lit = n => c.on(2, 2.5 + n * 0.7) && !c.on(2, 2.5 + n * 0.7 + 0.5);
      const ratio = 0.5 - 0.18 * c.p(2, 2.5, 0.6) + 0.12 * c.p(2, 3.9, 0.6);
      const inMode = c.on(2, 1.2) && !c.on(3, 0.6);
      return [
        title(`SEQUENCES &amp; <span class="y">MODES</span>`, { p: c.p(0) }),
        `<div style="opacity:${A}">`,
        code({ x: 160, y: 250, w: 1000, src: '-- keys joined with >\nrex.bind("ctrl+b>c", "client.tab.new")\nrex.bind("ctrl+b>z", "pane.zoom")', p: c.p(0, 0.4), name: 'init.lua' }),
        at(660, 560, `${keys(['ctrl', 'B'], { lit: k1, color: C.yellow })}<span class="hl" style="font-size:70px;color:${C.muted};margin:0 26px">&gt;</span>${key('C', { lit: k2, color: C.yellow })}`, { align: 'center', p: c.p(1) }),
        textAt(660, 720, '<span class="key" style="font-size:26px">esc</span> cancels partway', { size: 34, color: C.muted, align: 'center', p: c.p(1, 3) }),
        miniWin({ x: 1240, y: 300, w: 560, h: 380, p: c.p(1, 0.2), tabs: [{ label: '1', active: !newTab }, ...(newTab ? [{ label: '2', active: true, color: C.yellow }] : [])], panes: [{ x: 0, y: 0, w: 1, h: 1, color: newTab ? C.yellow : C.line, label: newTab ? 'new tab' : '' }] }),
        `</div><div style="opacity:${B}">`,
        code({ x: 100, y: 240, w: 1080, fs: 23, src: 'rex.mode("resize", { exclusive = true })\nrex.bind("cmd+r", "client.mode.enter", { name = "resize" })\nrex.bind("resize/left",  "pane.resize", { direction = "left" })\nrex.bind("resize/right", "pane.resize", { direction = "right" })', hl: c.on(3, 2) ? [0] : c.on(2, 2.5) ? [2, 3] : [1], p: B }),
        at(620, 610, `${keys(['⌘', 'R'], { lit: c.on(2, 1) && !c.on(2, 1.6), color: C.yellow })}<span style="display:inline-block;width:50px"></span>${['←', '→', '←'].map((a, i) => key(a, { lit: lit(i), color: C.yellow })).join(' ')}<span style="display:inline-block;width:50px"></span>${key('esc', { lit: c.on(3, 0.3) && !c.on(3, 0.9), color: C.red })}`, { align: 'center', p: c.p(2, 0.6) }),
        miniWin({ x: 1220, y: 280, w: 600, h: 420, modeBadge: inMode ? 'RESIZE' : '', p: c.p(2, 0.4), color: inMode ? C.yellow : C.cream, panes: [{ x: 0, y: 0, w: ratio, h: 1, color: C.green, label: 'nvim' }, { x: ratio, y: 0, w: 1 - ratio, h: 1, color: C.blue, label: 'zsh' }] }),
        at(620, 800, `${pill('exclusive = true', C.yellow, { size: 34 })}<span class="body" style="font-size:34px;color:${C.cream};margin-left:20px">only the mode's keys work</span>`, { align: 'center', p: c.p(3, 2.4) }),
        `</div>`,
      ].join('');
    },
  },

  // 11 ─ Custom actions
  {
    chapter: 'CUSTOM ACTIONS',
    say: [
      "When a built-in action isn't enough, write your own.",
      'rex dot action takes a name, a title, and a run function.',
      "Once it's loaded, it works like any built-in action: bind it to a key, find it in the command palette by its title, or run it with rex do.",
      "Custom action names never contain a dot, so you can always tell yours apart from the app's, like pane dot split.",
    ],
    render: c => {
      const src = 'rex.action{\n  name  = "scratch",\n  title = "Open Scratch Window",\n  run   = function(ctx, args)\n    rex.session.new_window{\n      layout = rex.layout.block{\n        flavor = "com.superlogical.terminal.shell",\n      },\n    }\n  end,\n}\n\nrex.bind("shift+cmd+n", "scratch")';
      const ways = [
        ['KEY', C.yellow, keys(['⇧', '⌘', 'N'])],
        ['PALETTE', C.green, `<span class="body" style="font-size:32px;color:${C.cream}">“Open Scratch Window”</span>`],
        ['CLI', C.blue, `<span class="mono" style="font-size:32px;color:${C.cream}">${sh('rex do scratch')}</span>`],
      ];
      return [
        title(`YOUR OWN <span class="g">ACTIONS</span>`, { p: c.p(0) }),
        code({ x: 100, y: 220, w: 1000, src, fs: 25, p: c.p(1), reveal: c.lin(1, 0.2, 2.5), hl: c.seg === 1 ? [1, 2, 3] : [] }),
        ...ways.map((wy, i) => box(1200, 240 + i * 200, 620, 160, { color: wy[1], label: wy[0], p: c.p(2, 0.8 + i * 1.3), inner: `<div style="display:flex;align-items:center;justify-content:center;height:100%">${wy[2]}</div>` })),
        at(1200, 880, `<div style="display:flex;gap:30px;align-items:center">${pill('pane.split', C.muted, { size: 34 })}<span class="body" style="font-size:28px;color:${C.muted}">app</span>${pill('scratch', C.green, { size: 34, fill: true })}<span class="body" style="font-size:28px;color:${C.green}">yours</span></div>`, { p: c.p(3, 0.5) }),
      ].join('');
    },
  },

  // 12 ─ Lua scripts
  {
    chapter: 'LUA SCRIPTS',
    say: [
      'For one-off automation, write a script and run it with rex do.',
      'A script can do anything a client can: create windows, start terminals, read screens, and react to what happens.',
      'Layouts are built from blocks, split horizontally or vertically, and nested as deep as you like.',
      'This script runs your tests in a split beside you, waits for them to finish, and zooms the split if they fail.',
    ],
    render: c => {
      const A = span(c, 0, 2), B = span(c, 2, 3), D = c.p(3, 0, 0.45);
      const caps = ['create windows', 'start terminals', 'read screens', 'react to events'];
      const lay = 'rex.layout.horizontal(0.5,\n  rex.layout.block{ flavor = shell },\n  rex.layout.vertical(0.5,\n    rex.layout.block{ flavor = shell },\n    rex.layout.block{ flavor = shell }))';
      const ts = 'local split = rex.session.new_split{\n  direction = "horizontal", focus = false,\n  layout = rex.layout.block{ ... sh -c cmd ... },\n}\nlocal ev = rex.wait("terminal.child_exited",\n  { block_id = id }, 600)\nif ev.exit_code ~= 0 then\n  rex.session.zoom_block{ block_id = id, zoom = true }\nend';
      const t3 = c.t - c.st(3);
      const failed = t3 > 4.2, zoom = c.p(3, 5.4, 0.7);
      const tw = 0.5 + 0.5 * zoom;
      return [
        title(`SCRIPTS WITH <span class="mono y" style="text-transform:none">rex do</span>`, { p: c.p(0) }),
        `<div style="opacity:${A}">`,
        term({ x: 260, y: 250, w: 1400, h: 200, name: 'zsh', fs: 34, lines: [sh(esc(c.typed('rex do tests.lua cmd="go test ./..."', 0, 0.8, 22)) + cur(c.t))], p: c.p(0, 0.3) }),
        at(960, 560, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:30px 60px">${caps.map((s, i) => `<div style="opacity:${c.p(1, 1 + i * 0.8)}" class="body"><span style="font-size:46px;color:${C.cream};font-weight:700">${icon('check', C.green, 46)} ${s}</span></div>`).join('')}</div>`, { align: 'center' }),
        `</div><div style="opacity:${B}">`,
        code({ x: 100, y: 260, w: 900, src: lay, fs: 26, name: 'layout.lua', p: B }),
        miniWin({ x: 1100, y: 260, w: 720, h: 480, p: B, panes: [
          { x: 0, y: 0, w: 0.5, h: 1, color: C.green, label: 'block', o: c.p(2, 0.8) },
          { x: 0.5, y: 0, w: 0.5, h: 0.5, color: C.blue, label: 'block', o: c.p(2, 2) },
          { x: 0.5, y: 0.5, w: 0.5, h: 0.5, color: C.yellow, label: 'block', o: c.p(2, 2.6) }] }),
        textAt(1460, 790, 'horizontal( block, vertical( block, block ) )', { size: 26, font: 'mono', color: C.muted, align: 'center', p: c.p(2, 3) }),
        `</div><div style="opacity:${D}">`,
        code({ x: 80, y: 240, w: 980, src: ts, fs: 24, name: 'tests.lua', p: D, hl: t3 < 2 ? [0, 1, 2, 3] : t3 < 4.6 ? [4, 5] : [6, 7, 8] }),
        miniWin({ x: 1120, y: 260, w: 720, h: 480, p: D, panes: [
          { x: 0, y: 0, w: 1 - tw, h: 1, color: C.cream, label: 'you', o: 1 - zoom },
          { x: 1 - tw, y: 0, w: tw, h: 1, color: failed ? C.red : C.yellow, label: 'tests', content: failed
            ? `<div style="font-size:26px;color:${C.red}">FAIL&nbsp; auth_test.go:42</div><div style="font-size:26px;color:${C.red}">exit status 1</div>`
            : `<div style="font-size:26px;color:${C.yellow}">${spinner(c.t, 28, C.yellow)} go test ./...</div>`, o: c.p(3, 1.2) }] }),
        badge(1760, 200, false, { p: c.p(3, 4.4), size: 110, z: 9 }),
        `</div>`,
      ].join('');
    },
  },

  // 13 ─ Events
  {
    chapter: 'EVENTS',
    say: [
      'Scripts can also keep running and react to events, with rex dot on.',
      'A terminal changes directory, a program exits, a bell rings, a window closes. Each one is an event.',
      'This handler labels every terminal with the folder it is in. Another can turn any bell into a Mac notification.',
      'Add dash dash all to listen across every session, or watch the raw stream with rex events.',
    ],
    render: c => {
      const evs = ['terminal.pwd_changed', 'terminal.child_exited', 'terminal.bell', 'window_closed', 'session_created', 'block_created', 'terminal.title_changed'];
      const cols = [C.green, C.red, C.yellow, C.blue, C.cream, C.green, C.blue];
      const flow = span(c, 1, 2);
      const src = '-- label.lua\nrex.on("terminal.pwd_changed", function(ctx, ev)\n  local dir = ev.pwd:match("([^/]+)/?$")\n  rex.session.set_block_label{\n    block_id = ctx.block_id, label = dir,\n  }\nend)';
      const t2 = c.t - c.st(2);
      const lbl = t2 > 2 ? 'api' : 'zsh';
      const showDemo = c.p(2, 0.3) * (1 - c.p(3, -0.3, 0.3));
      return [
        title(`REACT TO <span class="g">EVENTS</span>`, { p: c.p(0) }),
        code({ x: 100, y: 230, w: 1000, src, fs: 26, name: 'label.lua', p: c.p(0, 0.4) * (1 - flow * 0.75) }),
        `<div style="opacity:${flow}">`,
        ...evs.map((e, i) => {
          const x = 1950 - ((c.t - c.st(1)) * 420 - i * 420);
          return x > 1950 || x < -700 ? '' : at(x, 600 + (i % 3) * 110, pill(e, cols[i], { size: 34 }), { p: 1, dy: 0 });
        }),
        `</div>`,
        `<div style="opacity:${showDemo}">`,
        miniWin({ x: 1180, y: 250, w: 640, h: 420, panes: [
          { x: 0, y: 0, w: 1, h: 1, color: C.green, label: `label: ${lbl}`, content: `<div style="font-size:26px;color:${C.cream}">${sh(t2 > 1 ? 'cd ~/src/api' : '')}</div>` }] }),
        at(1180, 720, `<div style="width:640px;border:4px solid ${C.cream};border-radius:18px;background:${C.panel2};padding:20px 26px"><div class="body" style="font-size:28px;font-weight:800;color:${C.cream}">Rex</div><div class="body" style="font-size:28px;color:${C.cream}">Bell in api</div></div>`, { p: c.p(2, 4.2), dx: 80, dy: 0 }),
        `</div>`,
        term({ x: 1150, y: 260, w: 700, h: 560, name: 'zsh', fs: 22, p: c.p(3, 0.2), lines: [
          sh('rex do notify.lua --all'),
          { t: 'listening: 1 handler; Ctrl-C to stop', c: C.muted }, '',
          ...(c.on(3, 2.6) ? [sh('rex events -s work'),
            { t: '14:38:07 block_created  …65951c', c: C.cream },
            { t: '14:38:07 session_view_changed', c: C.cream },
            { t: '14:38:07 block_event  …bell', c: C.yellow }] : [])] }),
      ].join('');
    },
  },

  // 14 ─ Agents
  {
    chapter: 'AGENTS',
    say: [
      'Rex is built for coding agents, too.',
      'Run Install Rex for Agents from the command palette, or rex skill setup in a terminal. It sets up Claude Code, Codex, OpenCode, and Pi.',
      "Now your agent can open tabs and split panes, start a dev server and tell you when it's ready, or run tests beside you and read the failures straight off the screen.",
      'Say here, and it works in its own session. Say the focused pane, and it uses what you are looking at. Use a name, and the name wins.',
      'Anything that drives the app itself needs Remote Control turned on in settings.',
    ],
    render: c => {
      const A = span(c, 1, 2), B = span(c, 2, 3), D = span(c, 3, 4);
      const t2 = c.t - c.st(2);
      const ready = t2 > 5.5;
      const targets = [['“here”', "the agent's own session", C.green], ['“the focused pane”', "what you're looking at", C.blue], ['“logs”', 'a name always wins', C.yellow]];
      const on = c.p(4, 1.2, 0.4);
      return [
        title(`BUILT FOR <span class="g">AGENTS</span>`, { p: c.p(0) }),
        blob({ x: 860, y: 420, s: 1.1, t: c.t, p: c.p(0, 0.3) * (1 - c.p(1, -0.2, 0.3)), mood: 'wow' }),
        `<div style="opacity:${A}">`,
        at(960, 220, pill('⌘⇧P &rarr; Install Rex for Agents', C.green, { size: 38 }), { align: 'center', p: c.p(1, 0.3) }),
        term({ x: 360, y: 330, w: 1200, h: 520, name: 'zsh', fs: 30, lines: [
          sh('rex skill setup'), ...(c.on(1, 3) ? [
            { t: 'Claude Code', c: C.cream }, { t: '  skill  created   ~/.claude/skills/rex', c: C.green }, '',
            { t: 'Codex, OpenCode, Pi', c: C.cream }, { t: '  skill  created   ~/.agents/skills/rex', c: C.green }, '',
            { t: 'Start a new agent session inside Rex to use it.', c: C.muted }] : [])], p: c.p(1, 1.6) }),
        `</div><div style="opacity:${B}">`,
        at(120, 260, `<div class="bubble">Start the dev server in another tab and tell me when it's ready.</div>`, { p: c.p(2, 0.2) }),
        blob({ x: 200, y: 560, s: 1.1, t: c.t, p: c.p(2, 0.8), mood: ready ? 'happy' : 'wow' }),
        miniWin({ x: 900, y: 250, w: 900, h: 520, p: c.p(2, 1.2), tabs: [{ label: 'agent' }, ...(t2 > 2.4 ? [{ label: 'server', active: true, color: ready ? C.green : C.blue }] : [])], panes: [
          { x: 0, y: 0, w: 1, h: 1, color: ready ? C.green : C.blue, label: t2 > 2.4 ? 'server' : 'agent', content: t2 > 2.4
            ? `<div style="font-size:26px;color:${C.cream}">${sh('npm run dev')}</div>` + (ready ? `<div style="font-size:26px;color:${C.green};margin-top:10px">ready &mdash; listening on :3000</div>` : `<div style="font-size:26px;color:${C.blue};margin-top:10px">${spinner(c.t, 28)} starting…</div>`)
            : '' }] }),
        at(120, 870, `<div class="bubble agent">The server is ready on port 3000.</div>`, { p: c.p(2, 6) }),
        `</div><div style="opacity:${D}">`,
        ...targets.map((tg, i) => box(140 + i * 560, 330, 520, 360, { color: tg[2], p: c.p(3, 0.2 + i * 2.6), pop: true, inner:
          `<div style="padding:60px 34px"><div class="body" style="font-size:46px;font-weight:800;color:${tg[2]}">${tg[0]}</div><div class="body" style="font-size:34px;color:${C.cream};margin-top:30px">${tg[1]}</div></div>` })),
        `</div>`,
        at(960, 420, `<div style="display:flex;align-items:center;gap:40px;border:5px solid ${C.cream};border-radius:24px;padding:40px 60px;background:${C.panel}"><span class="body" style="font-size:52px;font-weight:800;color:${C.cream}">Remote Control</span>
          <span style="display:inline-block;width:150px;height:80px;border-radius:40px;background:${on > 0.5 ? C.green : C.line};position:relative"><span style="position:absolute;top:8px;left:${8 + on * 70}px;width:64px;height:64px;border-radius:32px;background:${C.cream}"></span></span></div>`, { align: 'center', p: c.p(4, 0.2) }),
        textAt(960, 640, 'Settings &rarr; lets the CLI and agents drive the app', { size: 36, color: C.muted, align: 'center', p: c.p(4, 1.6) }),
      ].join('');
    },
  },

  // 15 ─ Program status protocol
  {
    chapter: 'PROGRAM STATUS',
    say: [
      'With ten terminals going, how do you know which one needs you? Enter the Program Status Protocol.',
      'Programs report what they are doing: idle, working, done, blocked, or error, and why.',
      "Rex shows it for you: a spinner on busy tabs, symbols for blocked ones, and markers in the session picker for work that's finished or waiting on you.",
    ],
    render: c => {
      const states = [['idle', C.muted, icon('ring', C.muted, 40)], ['working', C.blue, spinner(c.t, 40)], ['done', C.green, icon('check', C.green, 40)], ['blocked', C.yellow, icon('bang', C.yellow, 40)], ['error', C.red, icon('cross', C.red, 40)]];
      const A = span(c, 0, 1);
      const tabs = [['build', 1], ['agent', 3], ['deploy', 1], ['tests', 2], ['docs', 0]];
      const sess = [['api', 3, 'Approve deploy?'], ['website', 2, 'Upgraded 12 packages'], ['research', 0, '']];
      return [
        title(`WHO <span class="y">NEEDS</span> YOU?`, { p: c.p(0) }),
        `<div style="opacity:${A}">`,
        ...Array.from({ length: 10 }, (_, i) => term({ x: 170 + (i % 5) * 320, y: 260 + Math.floor(i / 5) * 300, w: 280, h: 230, name: '?', fs: 18, lines: [{ t: bars(3), c: C.line }], p: c.p(0, 0.3 + i * 0.12), pop: true })),
        `</div>`,
        at(960, 240, `<div style="display:flex;gap:30px">${states.map((s, i) => `<div style="opacity:${c.p(1, 0.6 + i * 0.6)};border:5px solid ${s[1]};border-radius:22px;padding:24px 30px;text-align:center;width:200px"><div>${s[2]}</div><div class="hl" style="font-size:44px;color:${s[1]};margin-top:10px">${s[0].toUpperCase()}</div></div>`).join('')}</div>`, { align: 'center', p: c.p(1) * (1 - c.p(2, -0.2, 0.3)) }),
        textAt(960, 560, esc('ESC ] 7501 ; state=blocked:kind=permission:msg=… ESC \\'), { size: 32, font: 'mono', color: C.muted, align: 'center', p: c.p(1, 4) * (1 - c.p(2, -0.2, 0.3)) }),
        textAt(960, 640, 'an open terminal protocol &middot; OSC 7501', { size: 32, color: C.muted, align: 'center', p: c.p(1, 4.5) * (1 - c.p(2, -0.2, 0.3)) }),
        at(120, 260, `<div style="display:flex;gap:14px">${tabs.map(([n, s], i) => `<div class="mtab" style="font-size:30px;padding:14px 24px;display:flex;gap:12px;align-items:center;opacity:${c.p(2, 0.4 + i * 0.25)}">${n}${s === 1 ? spinner(c.t + i, 30) : s ? states[s + 0][2].replace(/width="40" height="40"/, 'width="30" height="30"') : ''}</div>`).join('')}</div>`, { p: c.p(2, 0.2) }),
        textAt(120, 360, 'TAB HEADERS', { size: 34, font: 'hl', color: C.muted, p: c.p(2, 1) }),
        at(1080, 450, `<div style="width:720px;border:5px solid ${C.cream};border-radius:22px;background:${C.panel};padding:20px">${sess.map(([n, s, m]) => `<div style="display:flex;align-items:center;gap:20px;padding:18px 20px"><span>${s ? states[s][2] : icon('ring', C.line, 40)}</span><span class="body" style="font-size:38px;font-weight:700;color:${C.cream}">${n}</span><span class="body" style="font-size:28px;color:${C.muted};margin-left:auto">${m}</span></div>`).join('')}</div>`, { p: c.p(2, 3.5) }),
        textAt(1080, 770, 'SESSION PICKER', { size: 34, font: 'hl', color: C.muted, p: c.p(2, 4) }),
        blob({ x: 300, y: 560, s: 1.1, t: c.t, p: c.p(2, 5), mood: 'happy' }),
      ].join('');
    },
  },

  // 16 ─ Server API
  {
    chapter: 'SERVER API',
    say: [
      'Under it all is the server API, and it documents itself.',
      'rex api list shows every method. rex api describe explains one, with examples. And rex api call runs it.',
      'The command line and Lua are both built on this same API, so whatever you discover here, you can script.',
    ],
    render: c => {
      const L = [];
      if (c.on(1, 0.2)) L.push(sh('rex api list -q | grep label'), { t: 'client.set_label', c: C.cream }, { t: 'session.set_block_label', c: C.cream }, { t: 'session.set_label', c: C.cream });
      if (c.on(1, 2.6)) L.push(sh('rex api describe session.set_block_label'), { t: "Update a block's human-readable display label.", c: C.muted });
      if (c.on(1, 5)) L.push(sh('rex api call server.version'), { t: '{ "rex_version": "0.1.0", "platform": "darwin_arm64" }', c: C.yellow });
      L.push(sh(cur(c.t)));
      const layers = [['CLI', C.green], ['LUA', C.yellow], ['AGENTS', C.blue]];
      return [
        title(`THE <span class="b">SERVER API</span>`, { p: c.p(0) }),
        term({ x: 100, y: 240, w: 1100, h: 640, name: 'zsh', lines: L, fs: 27, p: c.p(0, 0.4) }),
        ...layers.map((l, i) => box(1290 + i * 180, 340, 160, 300, { color: l[1], p: c.p(2, 0.6 + i * 0.4), inner: `<div class="hl" style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:54px;color:${l[1]};height:100%;display:flex;align-items:center;justify-content:center">${l[0]}</div>` })),
        box(1290, 670, 520, 140, { color: C.cream, p: c.p(2, 0.2), fill: C.panel2, inner: `<div class="hl" style="text-align:center;padding-top:30px;font-size:58px;color:${C.cream}">SERVER API</div>` }),
      ].join('');
    },
  },

  // 17 ─ Recap
  {
    chapter: 'RECAP',
    say: [
      "Let's recap.",
      'Sessions hold windows. Windows hold blocks. And clients connect to the server.',
      'Actions do the work. Bind them to keys, sequences, or modes in init dot lua.',
      'Automate with the rex command and Lua scripts, react with events, and let agents drive it for you.',
      'When you are stuck, check the docs, and share bugs and ideas in the feedback forum on the Rex Beta Discord. Welcome aboard!',
    ],
    render: c => {
      const items = [
        'Sessions &rarr; windows &rarr; blocks, served to clients',
        'Actions, bound to keys, sequences &amp; modes in <span class="mono y">init.lua</span>',
        'Automate with <span class="mono y">rex</span>, Lua scripts, events &amp; agents',
        'Docs + <span class="g">#feedback</span> on the Rex Beta Discord',
      ];
      const end = c.p(4, 4.5, 0.6);
      return [
        title('RECAP', { p: c.p(0), size: 150 }),
        `<div style="opacity:${1 - end}">`,
        ...items.map((s, i) => at(200, 300 + i * 150, `<div class="body" style="font-size:50px;font-weight:700;color:${C.cream};display:flex;align-items:center;gap:30px">${icon('check', C.green, 64)}<span>${s}</span></div>`, { p: c.p(i + 1, 0.2), dx: -40, dy: 0 })),
        `</div>`,
        textAt(960, 400, 'WELCOME ABOARD!', { size: 150, font: 'hl', color: C.green, align: 'center', p: end }),
        blob({ x: 830, y: 640, s: 1.3, t: c.t, p: end, mood: 'wink' }),
        textAt(960, 980, 'superlogical.com/rex/docs', { size: 34, font: 'mono', color: C.muted, align: 'center', p: end }),
      ].join('');
    },
  },
];

if (typeof module !== 'undefined') module.exports = { SCENES };
