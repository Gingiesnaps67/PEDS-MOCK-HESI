type Downloads = { save(o: { filename: string; data: string | Blob }): Promise<unknown> };

/** Save in either the original artifact host or a regular browser such as GitHub Pages. */
export async function saveBlob(filename: string, blob: Blob): Promise<boolean> {
  const c = (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
  try {
    const dl = c?.use ? (await c.use('downloads')) as Downloads | null : null;
    if (dl) { await dl.save({ filename, data: blob }); return true; }
  } catch { /* declined or unavailable — fall through */ }
  if (typeof URL.createObjectURL !== 'function') return false;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  try {
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    return true;
  } catch { return false; }
  finally {
    link.remove();
    // Give mobile browsers time to consume the Blob before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/** Keep the copy-paste fallback for embedded views without download support. */
export async function saveFile(filename: string, text: string, type = 'application/json') {
  if (await saveBlob(filename, new Blob([text], { type }))) return;
  window.dispatchEvent(new CustomEvent('peds-export', { detail: { filename, text } }));
}
