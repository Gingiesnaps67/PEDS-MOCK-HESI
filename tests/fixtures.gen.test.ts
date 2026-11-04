// Writes browser-audit fixtures (localStorage stores). Run on demand: AUDIT_FIXTURES=1 npx vitest run tests/fixtures.gen.test.ts
import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { ALL_ITEMS, CASES } from '../src/data/bank';
import { buildPractice, grade, applyAttempt } from '../src/engine/exam';
import { defaultStore } from '../src/engine/storage';
import { emptyResponse } from '../src/engine/scoring';
import type { ExamSettings, Item } from '../src/types';

it.runIf(process.env.AUDIT_FIXTURES)('write fixtures', () => {
  const S: ExamSettings = { navigation: 'free', minutes: 130, unscoredItems: false, confidence: true };
  const standalone = ALL_ITEMS.filter(i => !i.caseId);
  const caseItems = CASES.flatMap(c => c.items);
  const ordered: Item[] = [...standalone, ...caseItems];
  const s = defaultStore();
  s.active = buildPractice('tutor', 'AUDIT — every item', ordered, S, { tutor: false, timed: false });
  s.updatedAt = 1;
  writeFileSync('audit/store-all.json', JSON.stringify(s));
  // graded attempt with every item unanswered → full review list
  const r = defaultStore();
  const ex = buildPractice('tutor', 'AUDIT — review', ordered, S, { tutor: false, timed: false });
  ordered.forEach(i => { ex.responses[i.id] = emptyResponse(i); });
  const at = grade(ex);
  const r2 = applyAttempt(r, at);
  writeFileSync('audit/store-review.json', JSON.stringify(r2));
  writeFileSync('audit/attempt-id.txt', at.id);
  writeFileSync('audit/order.json', JSON.stringify(ordered.map(i => i.id)));
});
