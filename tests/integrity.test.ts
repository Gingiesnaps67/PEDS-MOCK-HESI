// Data-integrity audit across the whole bank (added 2026-10-14)
import { it, expect } from 'vitest';
import { ALL_ITEMS, CASES } from '../src/data/bank';
import { TOPICS } from '../src/data/blueprint';
it('every stem, option, rationale, chart entry, and table is complete, consistent with its stage, and carries units', () => {
  const out: string[] = [];
  const end = /[.?!:)"”’]$/;
  const bad = /\b(undefined|null|NaN|TODO|TBD|lorem)\b|\s{2,}|\.\.\.(?!\s*$)/;
  const paren = (t: string) => (t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length;
  const chk = (where: string, t: string | undefined, needEnd = true) => {
    if (!t) return;
    if (needEnd && !end.test(t.trim())) out.push(`END ${where}: …${t.slice(-50)}`);
    if (bad.test(t)) out.push(`BAD ${where}: ${t.slice(0, 80)}`);
    if (paren(t)) out.push(`PAREN ${where}: ${t.slice(0, 80)}`);
  };
  for (const i of ALL_ITEMS) {
    chk(`${i.id} stem`, i.stem); chk(`${i.id} correct`, i.rationale.correct); chk(`${i.id} priority`, i.rationale.priority); chk(`${i.id} clue`, i.rationale.clue);
    chk(`${i.id} memory`, i.rationale.memory); chk(`${i.id} simple`, i.rationale.simple);
    (i.rationale.options ?? []).forEach((n, k) => n && chk(`${i.id} note${k}`, n));
    if ('options' in i) (i.options as string[]).forEach((o, k) => chk(`${i.id} opt${k}`, o, false));
  }
  for (const c of CASES) {
    c.chart.forEach((e, k) => {
      chk(`${c.id} chart${k}`, e.text);
      if (e.table) e.table.rows.forEach((r, ri) => { if (r.length !== e.table!.head.length) out.push(`ROWLEN ${c.id} chart${k} row${ri}`); });
    });
    c.stageNotes.forEach((s, k) => chk(`${c.id} stageNote${k}`, s));
    for (const it of c.items) {
      const vis = c.chart.filter(e => e.stage <= (it.stage ?? 1));
      const blob = vis.map(e => [e.time ?? '', e.text ?? '', e.table ? [e.table.head, ...e.table.rows].flat().join(' ') : ''].join(' ')).join(' ');
      const times = it.stem.match(/\b([01]\d|2[0-3])[0-5]\d\b/g) || [];
      times.forEach(t => { if (!blob.includes(t)) out.push(`TIME ${it.id}: stem cites ${t} but chart at stage ${it.stage} lacks it`); });
      const tabsNeeded: [RegExp, string][] = [[/\bMAR\b/, 'mar'], [/\borders?\b/i, 'orders'], [/\blab(oratory)? (results|values)|CBC|\blabs\b/i, 'labs'], [/\bvital signs?\b|\btrend\b/i, 'vitals']];
      tabsNeeded.forEach(([re, tab]) => { if (re.test(it.stem) && !vis.some(e => e.tab === tab || (tab === 'vitals' && e.table) || (tab === 'labs' && e.table))) out.push(`TAB ${it.id}: stem mentions ${tab} but none visible`); });
      // later-stage leak: stem should not cite times only present at later stages
      const later = c.chart.filter(e => e.stage > (it.stage ?? 1) && e.time).map(e => e.time!);
      times.forEach(t => { if (later.includes(t) && !blob.includes(t)) out.push(`LEAK ${it.id}: ${t}`); });
    }
  }
  for (const t of TOPICS) [...t.findings, ...t.priorities, ...t.teaching, ...t.traps].forEach((x, k) => { if (/\s{2,}|undefined/.test(x)) out.push(`TOPIC ${t.n}.${k}`); });
  // numeric-only table cells without a unit hint in the header or row label (manual review list)
  const unitHint = /(pH|Pain|°C|bpm|\/min|mm Hg|mEq|mg|g\/dL|mL|kg|%|cm|\/mm³|U\/|sec|s\b|mmHg|L\b|HR|RR|BP|SpO|GCS|Time|Weight|Day|kg)/;
  for (const c of CASES) c.chart.forEach((e, k) => e.table?.rows.forEach(r => r.slice(1).forEach((cell, ci) => {
    if (/^[\d.,\s\/–-]+$/.test(cell.trim()) && !unitHint.test(e.table!.head[ci + 1] + ' ' + r[0])) out.push(`UNIT ${c.id} chart${k}: [${r[0]}] ${e.table!.head[ci + 1]} = ${cell}`);
  })));
  expect(out).toEqual([]);
});
