// Renders index.html frame by frame in headless Chrome and pipes the frames to ffmpeg.
//   node render.mjs                 -> out/rex-onboarding.mp4
//   node render.mjs --stills 12,95  -> out/still-12.png ... (quick previews at given seconds)
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FPS = Number(process.env.FPS || 30);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const timeline = JSON.parse(readFileSync('out/timeline.json', 'utf8'));
const total = timeline.at(-1).start + timeline.at(-1).dur;
const stillsArg = process.argv.indexOf('--stills');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('index.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(tl => window.setup(tl), timeline);
await page.evaluate(async () => {
  await Promise.all(["120px Anton", "600 40px Inter", "700 40px Inter", "800 40px Inter", "40px 'JetBrains Mono'", "600 40px 'JetBrains Mono'"].map(f => document.fonts.load(f)));
  window.renderFrame(5); await document.fonts.ready;
});
const stage = await page.$('#stage');

if (stillsArg > 0) {
  for (const s of process.argv[stillsArg + 1].split(',').map(Number)) {
    await page.evaluate(t => window.renderFrame(t), s);
    await stage.screenshot({ path: `out/still-${s}.png` });
    console.log(`out/still-${s}.png`);
  }
  await browser.close();
  process.exit(0);
}

// Encode video alone first; muxing audio and subtitles in the same pass can stall the frame pipe.
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
  'out/video-only.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });

const frames = Math.ceil(total * FPS);
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.renderFrame(t), f / FPS);
  const buf = await stage.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % (FPS * 10) === 0) console.log(`frame ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
  '-i', 'out/video-only.mp4', '-i', 'out/voice.wav', '-i', 'out/captions.srt',
  '-map', '0:v', '-map', '1:a', '-map', '2:s',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng',
  '-movflags', '+faststart', 'out/rex-onboarding.mp4']);
console.log(`done: out/rex-onboarding.mp4 (${total.toFixed(1)}s)`);
