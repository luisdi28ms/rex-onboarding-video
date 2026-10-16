// Renders index.html frame by frame in headless Chrome and encodes the video.
//   node render.mjs                 -> out/rex-onboarding.mp4
//   node render.mjs --stills 12,95  -> out/still-12.png ... (quick previews at given seconds)
// The video is rendered in chunks, each with a fresh browser, so a Chrome crash only
// costs one chunk; rerunning skips chunks that are already finished.
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FPS = Number(process.env.FPS || 30);
const CHUNK = Number(process.env.CHUNK || 900);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const timeline = JSON.parse(readFileSync('out/timeline.json', 'utf8'));
const total = timeline.at(-1).start + timeline.at(-1).dur;
const stillsArg = process.argv.indexOf('--stills');

async function openStage() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 120000, args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(resolve('index.html')).href, { waitUntil: 'networkidle0' });
  await page.evaluate(tl => window.setup(tl), timeline);
  await page.evaluate(async () => {
    await Promise.all(["120px Anton", "600 40px Inter", "700 40px Inter", "800 40px Inter", "40px 'JetBrains Mono'", "600 40px 'JetBrains Mono'"].map(f => document.fonts.load(f)));
    window.renderFrame(5); await document.fonts.ready;
  });
  return { browser, page, stage: await page.$('#stage') };
}

if (stillsArg > 0) {
  const { browser, page, stage } = await openStage();
  for (const s of process.argv[stillsArg + 1].split(',').map(Number)) {
    await page.evaluate(t => window.renderFrame(t), s);
    await stage.screenshot({ path: `out/still-${s}.png` });
    console.log(`out/still-${s}.png`);
  }
  await browser.close();
  process.exit(0);
}

async function renderChunk(from, to, file) {
  const { browser, page, stage } = await openStage();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', `${file}.part.mp4`],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  try {
    for (let f = from; f < to; f++) {
      await page.evaluate(t => window.renderFrame(t), f / FPS);
      const buf = await stage.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    const code = await new Promise(r => ff.on('close', r));
    if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
    renameSync(`${file}.part.mp4`, file);
  } catch (e) {
    ff.kill('SIGKILL');
    throw e;
  } finally {
    await browser.close().catch(() => {});
  }
}

mkdirSync('out/chunks', { recursive: true });
const frames = Math.ceil(total * FPS);
const files = [];
const t0 = Date.now();
for (let from = 0, i = 0; from < frames; from += CHUNK, i++) {
  const to = Math.min(frames, from + CHUNK);
  const file = `out/chunks/${String(i).padStart(3, '0')}.mp4`;
  files.push(file);
  if (existsSync(file)) continue;
  for (let attempt = 1; ; attempt++) {
    try { await renderChunk(from, to, file); break; }
    catch (e) {
      console.log(`chunk ${i} failed (attempt ${attempt}): ${e.message}`);
      if (attempt >= 3) throw e;
    }
  }
  console.log(`chunk ${i} done: frames ${from}-${to}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

writeFileSync('out/chunks/list.txt', files.map(f => `file '${resolve(f)}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'out/chunks/list.txt', '-c', 'copy', 'out/video-only.mp4']);
// Audio and subtitles are muxed in a separate pass; doing it while piping frames stalled ffmpeg.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
  '-i', 'out/video-only.mp4', '-i', 'out/voice.wav', '-i', 'out/captions.srt',
  '-map', '0:v', '-map', '1:a', '-map', '2:s',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng',
  '-movflags', '+faststart', 'out/rex-onboarding.mp4']);
console.log(`done: out/rex-onboarding.mp4 (${total.toFixed(1)}s)`);
