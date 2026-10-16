// Voices every `say` clip with macOS `say`, lays them on one track, and writes
// out/timeline.json (scene + clip start times), out/voice.wav and out/captions.srt.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const { SCENES } = createRequire(import.meta.url)('./scenes.js');
const VOICE = process.env.VOICE || 'Samantha';
const RATE = process.env.RATE || '178';
const SR = 48000, LEAD = 0.6, GAP = 0.35, TAIL = 1.0;

mkdirSync('out/clips', { recursive: true });

function clip(text) {
  const h = createHash('sha1').update(`${VOICE}|${RATE}|${text}`).digest('hex').slice(0, 12);
  const raw = `out/clips/${h}.raw`;
  if (!existsSync(raw)) {
    execFileSync('say', ['-v', VOICE, '-r', RATE, '-o', `out/clips/${h}.aiff`, text]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `out/clips/${h}.aiff`, '-ar', String(SR), '-ac', '1', '-f', 's16le', raw]);
  }
  return readFileSync(raw);
}

const timeline = [], placed = [];
let cursor = 0;
for (const sc of SCENES) {
  const starts = [];
  let t = LEAD;
  for (const text of sc.say) {
    const pcm = clip(text);
    starts.push(t);
    placed.push({ at: cursor + t, pcm, text, dur: pcm.length / 2 / SR });
    t += pcm.length / 2 / SR + GAP;
  }
  const dur = t - GAP + TAIL + (sc.extra || 0);
  timeline.push({ start: cursor, dur, starts });
  cursor += dur;
}

const out = Buffer.alloc(Math.ceil(cursor * SR) * 2);
for (const p of placed) p.pcm.copy(out, Math.round(p.at * SR) * 2);
writeFileSync('out/voice.raw', out);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', 'out/voice.raw', 'out/voice.wav']);
writeFileSync('out/timeline.json', JSON.stringify(timeline, null, 1));

const ts = s => { const ms = Math.round(s * 1000); const z = (n, w = 2) => String(n).padStart(w, '0');
  return `${z(Math.floor(ms / 3600000))}:${z(Math.floor(ms / 60000) % 60)}:${z(Math.floor(ms / 1000) % 60)},${z(ms % 1000, 3)}`; };
writeFileSync('out/captions.srt', placed.map((p, i) => `${i + 1}\n${ts(p.at)} --> ${ts(p.at + p.dur)}\n${p.text}\n`).join('\n'));

console.log(`${SCENES.length} scenes, ${placed.length} clips, ${cursor.toFixed(1)}s total`);
