// @vitest-environment node
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

const project = resolve('.');
const scope = 'https://gingiesnaps67.github.io/PEDS-MOCK-HESI/';
let fixture: string;
let worker: string;
const vendorFiles = [
  ['https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js', 'react/umd/react.production.min.js'],
  ['https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js', 'react-dom/umd/react-dom.production.min.js'],
  ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js', 'jspdf/dist/jspdf.umd.min.js'],
];
const packageSite = () => execFileSync(process.execPath, [join(project, 'scripts/pwa.mjs')], { cwd: fixture });

beforeAll(() => {
  fixture = mkdtempSync(join(tmpdir(), 'peds-pwa-test-'));
  mkdirSync(join(fixture, 'dist'));
  writeFileSync(join(fixture, 'dist/index.html'), '<html><head>' + vendorFiles.map(([url]) => `<script src="${url}"></script>`).join('') + '</head><body>Practice app</body></html>');
  for (const [, file] of vendorFiles) {
    const target = join(fixture, 'node_modules', file);
    mkdirSync(resolve(target, '..'), { recursive: true });
    writeFileSync(target, `/* ${file} */`);
  }
  mkdirSync(join(fixture, 'public-pwa'));
  for (const file of readdirSync(join(project, 'public-pwa'))) copyFileSync(join(project, 'public-pwa', file), join(fixture, 'public-pwa', file));
  packageSite();
  worker = readFileSync(join(fixture, 'site/sw.js'), 'utf8');
});
afterAll(() => rmSync(fixture, { recursive: true, force: true }));

function serviceWorker(failedPrecache = false) {
  const stores = new Map<string, Map<string, Response>>();
  const handlers: Record<string, (event: any) => void> = {};
  const key = (request: string | { url: string }) => new URL(typeof request === 'string' ? request : request.url, scope).href;
  const fetch = vi.fn(async () => new Response('Fresh app'));
  const skipWaiting = vi.fn();
  const claim = vi.fn();
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name)!;
      return {
        addAll: async (paths: string[]) => {
          if (failedPrecache) throw new Error('Required asset unavailable');
          for (const path of paths) entries.set(key(path), new Response(`Cached ${path}`));
        },
        match: async (request: string | { url: string }) => entries.get(key(request))?.clone(),
        put: async (request: string | { url: string }, response: Response) => { entries.set(key(request), response.clone()); },
      };
    },
  };
  runInNewContext(worker, {
    URL, caches, fetch,
    self: {
      location: { origin: new URL(scope).origin }, registration: { scope },
      addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; },
      skipWaiting, clients: { claim },
    },
  });
  const lifecycle = async (name: 'install' | 'activate') => {
    let pending: Promise<unknown> | undefined;
    handlers[name]({ waitUntil: (value: Promise<unknown>) => { pending = value; } });
    await pending;
  };
  const request = (url: string, mode = 'navigate') => {
    let response: Promise<Response> | undefined;
    handlers.fetch({ request: { url, method: 'GET', mode }, respondWith: (value: Promise<Response>) => { response = value; } });
    return response;
  };
  return { stores, fetch, skipWaiting, claim, lifecycle, request };
}

it('packages the installable app with project-relative URLs and all original icons', () => {
  const manifest = JSON.parse(readFileSync(join(fixture, 'site/manifest.webmanifest'), 'utf8'));
  expect(new URL(manifest.start_url, scope).href).toBe(scope);
  expect(new URL(manifest.scope, scope).href).toBe(scope);
  expect(manifest.icons.some((icon: any) => icon.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) {
    expect(new URL(icon.src, scope).pathname).toMatch(/^\/PEDS-MOCK-HESI\//);
    expect(readFileSync(join(fixture, 'site', icon.src))).toEqual(readFileSync(join(project, 'public-pwa', icon.src)));
  }
  const html = readFileSync(join(fixture, 'site/index.html'), 'utf8');
  expect(html).toContain('href="apple-touch-icon.png"');
  expect(html).toContain("register('sw.js')");
  expect(html).not.toContain('cdnjs.cloudflare.com');
});

it('installs every required asset and preserves caches owned by other projects', async () => {
  const sw = serviceWorker();
  const ownOld = `peds-hesi:${scope}:old`;
  const otherProject = 'peds-hesi:https://gingiesnaps67.github.io/other-app/:old';
  sw.stores.set(ownOld, new Map());
  sw.stores.set(otherProject, new Map());
  sw.stores.set('chartwell-offline-cache', new Map());
  await sw.lifecycle('install');
  expect(sw.skipWaiting).toHaveBeenCalledOnce();
  await sw.lifecycle('activate');
  expect(sw.stores.has(ownOld)).toBe(false);
  expect(sw.stores.has(otherProject)).toBe(true);
  expect(sw.stores.has('chartwell-offline-cache')).toBe(true);
  expect(sw.claim).toHaveBeenCalledOnce();
  const cachedIcon = await sw.request(scope + 'icon-maskable-512.png', 'same-origin');
  expect(await cachedIcon!.text()).toBe('Cached icon-maskable-512.png');
  expect(sw.fetch).not.toHaveBeenCalled();
});

it('keeps the existing worker when required offline files cannot be cached', async () => {
  const sw = serviceWorker(true);
  await expect(sw.lifecycle('install')).rejects.toThrow('Required asset unavailable');
  expect(sw.skipWaiting).not.toHaveBeenCalled();
});

it('resumes offline and keeps a server error from replacing the saved app', async () => {
  const sw = serviceWorker();
  await sw.lifecycle('install');
  sw.fetch.mockResolvedValueOnce(new Response('Server unavailable', { status: 503 }));
  const onServerError = await sw.request(scope);
  expect(await onServerError!.text()).toBe('Cached index.html');
  sw.fetch.mockRejectedValueOnce(new Error('Offline'));
  const offline = await sw.request(scope);
  expect(await offline!.text()).toBe('Cached index.html');
  expect(sw.request('https://gingiesnaps67.github.io/other-app/')).toBeUndefined();
  expect(sw.request('https://fonts.googleapis.com/example.css', 'cors')).toBeUndefined();
});

it('updates the offline cache identity whenever packaged content changes', () => {
  packageSite();
  expect(readFileSync(join(fixture, 'site/sw.js'), 'utf8')).toBe(worker);
  writeFileSync(join(fixture, 'public-pwa/icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><title>Changed icon</title></svg>');
  packageSite();
  expect(readFileSync(join(fixture, 'site/sw.js'), 'utf8')).not.toBe(worker);
});
