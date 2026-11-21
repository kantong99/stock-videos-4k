// Render deterministik: setiap frame digambar di canvas Chromium, dikirim sebagai PNG ke ffmpeg.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };

const scene = get('scene');
if (!['silk', 'terrain', 'aurora'].includes(scene)) {
  console.error('Pakai: node render.js --scene silk|terrain|aurora [--seconds 20] [--fps 30] [--preview true]');
  process.exit(1);
}
const preview = get('preview', 'false') === 'true';
const fps = Number(get('fps', 30));
const seconds = Number(get('seconds', preview ? 4 : 20));
const W = preview ? 1920 : 3840, H = preview ? 1080 : 2160;
const N = Math.round(seconds * fps);

fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
const outFile = path.join(dir, 'out', `${scene}_${W}x${H}_${fps}fps${preview ? '_preview' : ''}.mp4`);

const ff = spawn('ffmpeg', [
  '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
  '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'slow', '-crf', preview ? '20' : '14',
  '-profile:v', 'high', '-g', String(fps * 2),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-movflags', '+faststart', outFile
], { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise((res, rej) => { ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg gagal: ' + c))); });

const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}" style="display:block"></canvas></body>`);
await page.addScriptTag({ path: path.join(dir, 'scenes', scene + '.js') });
await page.evaluate(([w, h]) => {
  window.W = w; window.H = h;
  window.ctx = document.getElementById('c').getContext('2d');
  window.SCENE.init(window.ctx, w, h);
}, [W, H]);

console.log(`Render ${scene}: ${N} frame, ${W}x${H}, ${fps} fps -> ${outFile}`);
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  await page.evaluate(([t, i]) => window.SCENE.draw(window.ctx, window.W, window.H, t, i), [f / N, f]);
  const png = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 30 === 0) console.log(`frame ${f}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} dtk)`);
}
ff.stdin.end();
await ffDone;
await browser.close();
console.log('Selesai:', outFile);
