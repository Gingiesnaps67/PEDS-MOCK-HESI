// Turn Vite's single-file build into an artifact page fragment (the host adds doctype/html/head/body).
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist/index.html', 'utf8');
const appRe = /<script type="module"[^>]*>[\s\S]*?<\/script>/;
const app = [html.match(appRe)[0]];
const rest = html.replace(appRe, '');
const head = rest.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = rest.match(/<body>([\s\S]*?)<\/body>/)[1];
const pick = (re) => [...head.matchAll(re)].map(m => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/g);
const links = pick(/<link[^>]*>/g);
const styles = pick(/<style[^>]*>[\s\S]*?<\/style>/g);
const cdn = pick(/<script src="https:\/\/cdnjs[^"]+"><\/script>/g);
if (title.length !== 1 || !styles.length || cdn.length !== 2 || app.length !== 1) throw new Error('unexpected build shape');
const out = [...title, ...links, ...styles, ...cdn, body.trim(), ...app].join('\n');
writeFileSync('dist/peds-hesi-2026.html', out);
console.log('fragment bytes', out.length);
