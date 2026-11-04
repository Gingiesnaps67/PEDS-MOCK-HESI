import { afterEach, expect, it, vi } from 'vitest';
import { jsPDF } from 'jspdf';
import { buildPdf, downloadPdf } from '../src/ui/pdf';
import { saveFile } from '../src/ui/util';
import { buildPractice, grade } from '../src/engine/exam';
import { defaultStore } from '../src/engine/storage';
import { getItem } from '../src/data/bank';

const attempt = () => grade(buildPractice('tutor', 'Download regression', [getItem('A01')!], defaultStore().settings, { timed: false }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

function captureDownload() {
  const files: { name: string; href: string }[] = [];
  const blobs: Blob[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    files.push({ name: this.download, href: this.href });
  });
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL(blob: Blob) { blobs.push(blob); return 'blob:download-test'; }
    static revokeObjectURL = vi.fn();
  });
  vi.useFakeTimers();
  return { files, blobs };
}

it('generates a real PDF report with the packaged jsPDF library', async () => {
  vi.stubGlobal('jspdf', { jsPDF });
  const blob = await buildPdf(attempt());
  expect(blob.type).toBe('application/pdf');
  expect(blob.size).toBeGreaterThan(3000);
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
  expect(text).toMatch(/^%PDF-/);
  expect(text).toContain('PEDS HESI 2026');
  expect(text).toContain('Practice percentage');
});

it('downloads PDFs in a regular browser without the original host capability', async () => {
  vi.stubGlobal('jspdf', { jsPDF });
  vi.stubGlobal('claude', undefined);
  const { files, blobs } = captureDownload();
  expect(await downloadPdf(attempt())).toBe('PDF report ready.');
  expect(files[0].name).toMatch(/^peds-hesi-report-.*\.pdf$/);
  expect(blobs[0].type).toBe('application/pdf');
  expect(document.querySelector('a[download]')).toBeNull();
  vi.runAllTimers();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:download-test');
});

it('downloads JSON progress exports without a copy-paste step', async () => {
  vi.stubGlobal('claude', undefined);
  const { files, blobs } = captureDownload();
  await saveFile('peds-progress.json', '{"progress":1}');
  expect(files[0].name).toBe('peds-progress.json');
  expect(blobs[0].type).toBe('application/json');
  vi.runAllTimers();
});
