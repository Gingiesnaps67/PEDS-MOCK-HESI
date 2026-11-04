// Build the installable web-app version (for GitHub Pages or any static host) from dist/index.html.
// Output: site/ — index.html, manifest, service worker (offline), icons.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const html = readFileSync('dist/index.html', 'utf8');
mkdirSync('site', { recursive: true });

const head = `
<meta name="theme-color" content="#0f2a44">
<meta name="description" content="Pediatric HESI practice: mock exams, unfolding cases, growth and development centers, and rapid review.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="PEDS HESI">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`;
const register = `
<script>
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>`;
if (!html.includes('</head>') || !html.includes('</body>')) throw new Error('unexpected build shape');
// self-host the libraries so the installed app never depends on a CDN
const VENDOR = {
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js': 'node_modules/react/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js': 'node_modules/react-dom/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js': 'node_modules/jspdf/dist/jspdf.umd.min.js',
};
mkdirSync('site/vendor', { recursive: true });
let page = html;
for (const [url, file] of Object.entries(VENDOR)) {
  const name = file.split('/').pop();
  if (!page.includes(url)) throw new Error('missing ' + url);
  page = page.split(url).join('vendor/' + name);
  copyFileSync(file, 'site/vendor/' + name);
}
let out = page.replace('</head>', head + '\n</head>').replace('</body>', register + '\n</body>');
if (!/<meta name="viewport"/.test(out)) out = out.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">');
writeFileSync('site/index.html', out);

const manifest = JSON.stringify({
  name: 'PEDS HESI 2026',
  short_name: 'PEDS HESI',
  description: 'Pediatric HESI practice and study app',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0f2a44',
  theme_color: '#0f2a44',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2);
writeFileSync('site/manifest.webmanifest', manifest);

const icons = readdirSync('public-pwa').sort();
for (const f of icons) copyFileSync('public-pwa/' + f, 'site/' + f);
// A changed asset must produce a new cache, including builds made in the same minute.
const fingerprint = createHash('sha256').update(out).update(manifest);
for (const file of Object.values(VENDOR)) fingerprint.update(readFileSync(file));
for (const f of icons) fingerprint.update(readFileSync('public-pwa/' + f));
const version = fingerprint.digest('hex').slice(0, 16);

// Offline caches belong to this app's scope; GitHub Pages projects share an origin.
writeFileSync('site/sw.js', `const CACHE_PREFIX = 'peds-hesi:' + self.registration.scope + ':';
const CACHE = CACHE_PREFIX + '${version}';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'vendor/react.production.min.js', 'vendor/react-dom.production.min.js', 'vendor/jspdf.umd.min.js'];
self.addEventListener('install', e => {
  // Keep the previous worker active if any required offline asset cannot be saved.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Other projects and third-party resources keep their normal network behavior.
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  const isPage = req.mode === 'navigate' || url.pathname === new URL('index.html', self.registration.scope).pathname;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isPage) {
      try {
        const response = await fetch(req);
        if (response.ok) {
          await cache.put('index.html', response.clone()).catch(() => {});
          return response;
        }
        // A server error must not replace the last working offline page.
        return await cache.match('index.html') || await cache.match('./') || response;
      } catch (error) {
        const saved = await cache.match('index.html') || await cache.match('./');
        if (saved) return saved;
        throw error;
      }
    }
    const saved = await cache.match(req);
    if (saved) return saved;
    const response = await fetch(req);
    if (response.ok) await cache.put(req, response.clone()).catch(() => {});
    return response;
  })());
});
`);

writeFileSync('site/.nojekyll', '');
console.log('site/ built, cache version', version, 'index bytes', out.length);
