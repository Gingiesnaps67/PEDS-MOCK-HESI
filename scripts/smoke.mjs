// Smoke test of the built fragment: React UMD globals + inlined app bundle render the dashboard and run an exam.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
let frag = readFileSync('dist/peds-hesi-2026.html', 'utf8');
const react = readFileSync('node_modules/react/umd/react.production.min.js', 'utf8');
const rdom = readFileSync('node_modules/react-dom/umd/react-dom.production.min.js', 'utf8');
frag = frag.replace(/<script src="[^"]*react\.production\.min\.js"><\/script>/, () => `<script>${react}</script>`)
  .replace(/<script src="[^"]*react-dom\.production\.min\.js"><\/script>/, () => `<script>${rdom}</script>`)
  .replace('<script type="module" crossorigin>', '<script>');
const dom = new JSDOM(`<!doctype html><html><head><meta charset="utf8"></head><body>${frag}</body></html>`, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/' });
const w = dom.window;
const errors = [];
w.addEventListener('error', e => errors.push(e.message));
await new Promise(r => setTimeout(r, 400));
const doc = w.document;
const txt = () => doc.body.textContent;
console.log('dashboard rendered:', txt().includes('PEDS HESI 2026') && txt().includes('Start mock exam'));
const click = (label) => { const b = [...doc.querySelectorAll('button')].find(x => x.textContent.trim().startsWith(label)); if (!b) throw new Error('no button ' + label); b.click(); };
click('Start mock exam'); await new Promise(r => setTimeout(r, 100));
click('HESI 2 practice'); await new Promise(r => setTimeout(r, 200));
console.log('exam:', doc.querySelector('.exam-meta .mono')?.textContent, doc.querySelector('[role=timer]')?.textContent);
console.log('errors:', errors);
process.exit(errors.length ? 1 : 0);
