/**
 * Presentation-only cleanup for the PEDS HESI 2026 Mock Exam (11/03/2026).
 * Item data keeps its source metadata for internal verification; this strips citations and
 * lecture/instructor attributions from the text shown on the exam, results, and review screens.
 */
import { createContext, useContext } from 'react';

/** true inside mock-exam screens (active exam, results, item review) */
export const ExamCleanCtx = createContext(false);
export const useExamClean = () => useContext(ExamCleanCtx);
/** session kinds that are the PEDS HESI 2026 Mock Exam */
export const MOCK_KINDS = ['hesi', 'formA', 'formB', 'extended'];
export const isMock = (kind: string) => MOCK_KINDS.includes(kind);

const M = '\u0001'; // marks a removal point so the next letter can be capitalized
const SRC_WORD = /\b(lectures?|instructor|professor|textbook|ATI|PowerPoint|slides?|review #|Ch\s?\d{2}|Chapter \d{2}|master sheet|Table \d+\.\d+|Box \d+\.\d+|class|deck)\b/i;
/** a single source reference such as "ATI Ch9", "textbook Ch31", "lecture 9/30", "review #25", "the review’s" */
const SUBJ = String.raw`(?:(?:the|your|an?)\s+)?(?:(?:course|instructor(?:'|’)?s?)\s+)?(?:ATI(?:\s+(?:Ch\d+|notes|reading|reference|milestone reference|vital-sign notes))?(?:’s|'s)?|[Tt]extbook(?:\s+(?:Ch\d+|Table \d+\.\d+|Box \d+\.\d+))?|Ch\d+(?:\s+Table \d+\.\d+)?|[Ll]ecture(?:\s+\d+\/\d+)?|[Rr]eview(?:’s|'s)?(?:\s+#\d+)?|(?:course )?PowerPoint|[Ii]nstructor(?:’s|'s)? (?:review|deck|slides|lecture))`;
const BARE = String.raw`(?:ATI(?:\s+(?:Ch\d+|notes|reading|reference))?(?:’s|'s)?|[Tt]extbook\s+Ch\d+(?:\s+Table \d+\.\d+)?|Ch\d+(?:\s+Table \d+\.\d+)?|[Ll]ecture\s+\d+\/\d+|[Rr]eview\s+#\d+(?:\s+and\s+#\d+)*|(?:[Cc]ourse )?PowerPoint)`;
const VERB = String.raw`(names?|stresses|emphasizes|says?|lists?|suggests?|adds?|recommends?|allows?|warns?|teaches|teach|uses?|shows?|classif(?:y|ies)|places?|mentions?|notes?|states?|describes?)`;

const OVERRIDE: [RegExp, string][] = [
  [/^ATI \(Leading & Managing; Infection Control\):\s*/, ''],
  [/The ATI [\w-]+ reading and textbook Ch\d+ both list/g, 'Standard teaching lists'],
  [/\s+(?:in|from|per) (?:the |your )?ATI [\w -]*?(?:reference|reading|notes)\b/g, ''],
  [/consistent with (?:the )?(?:course )?sources/gi, 'accurate'],
  [/The source definition of pediatric hypertension is itself flagged as inconsistent, so the safe, source-supported step/g, 'The hypertension definition varies between references, so the safe step'],
  [/Rubella is a known source conflict, so it is not used here\./g, 'Rubella is left out because references disagree on its precautions.'],
  [/"Textbook Table 31\.3 shows 108\/70 for a 10-year-old/, '"The BP reference table shows 108/70 for a 10-year-old'],
];
const TRIGGER = /lecture|instructor|professor|textbook|\bATI\b|PowerPoint|review|\bCh\s?\d|chapter \d|course|sources?\b|Table \d|Box \d|\bclass\b|slides?|\bdeck\b|master sheet/i;
const thirdPerson = (v: string) => (v.endsWith('s') || v === 'teaches' ? v : v === 'classify' ? 'classifies' : v === 'teach' ? 'teaches' : v + 's');

export function cleanText(s: string | undefined): string {
  if (!s) return s ?? '';
  if (!TRIGGER.test(s)) return s; // nothing source-like: leave text (and its spacing) exactly as authored
  const lead = /^\s*/.exec(s)![0], trail = /\s*$/.exec(s)![0];
  let t = s;
  // a field that is nothing but a citation ("Review #69 report list.") disappears
  if (/^(?:Instructor HESI )?[Rr]eview\s+#\d+(?:\s+and\s+#\d+)*(?:\s+[a-z\- ]{0,30})?\.?$/.test(t.trim())) return '';
  OVERRIDE.forEach(([re, r]) => { t = t.replace(re, r); });
  // 1. parenthetical citations: (lecture 9/30), (ATI Ch11; textbook Ch32), (instructor’s review sequence)
  for (let i = 0; i < 3; i++) t = t.replace(/\s*\(([^()]*)\)/g, (m, inner: string) => (SRC_WORD.test(inner) ? '' : m));
  // 2. leading attributions ending in a colon: "Lecture 9/30: …", "Textbook Ch31 and ATI Ch27: …", "Review trap: …"
  t = t.replace(new RegExp(String.raw`(^|[.!?]\s+|;\s+|—\s+)(?:The\s+|the\s+)?` + SUBJ + String.raw`(?:\s*(?:and|,|/|&)\s*(?:` + SUBJ + String.raw`|[Ll]ecture\s+\d+\/\d+))*(?:\s+[a-z’']+){0,3}\s*:\s*`, 'g'), (_m, pre: string) => pre + M);
  t = t.replace(/(^|[.!?]\s+)(?:Your )?(?:course |instructor(?:’s|')? )?(?:review|lecture|deck)(?:’s|'s)? (?:trap|sequence|point|list)?:?\s*/g, (_m, pre: string) => pre + M);
  // 3. "<source> and <source> agree" / "<source> says/lists/…" → "standard teaching …"
  t = t.replace(new RegExp(SUBJ + String.raw`\s+and\s+` + SUBJ + String.raw`\s+agree\b`, 'g'), 'standard teaching agrees');
  t = t.replace(new RegExp(SUBJ + String.raw`\s+` + VERB + String.raw`\b`, 'g'), (_m, v: string) => 'standard teaching ' + thirdPerson(v));
  // 4. inline attribution phrases
  t = t
    .replace(/\b(?:according to|as (?:taught|discussed|stated|listed) in|from) (?:the |your |my )?(?:course |instructor(?:'|’)?s? )?(?:lecture|class|textbook|ATI|review|slides?|PowerPoint|notes)(?:\s*(?:\d+\/\d+|#\d+|Ch\d+))?,?\s*/gi, M)
    .replace(/\b(?:your|the) instructor (?:emphasized|stressed|teaches|taught|says|said)(?: that)?,?\s*/gi, '')
    .replace(/\bas discussed in class,?\s*/gi, '')
    .replace(/\bSIDS teaching in every source\b/g, 'SIDS teaching').replace(/\bin every source\b/g, 'in standard teaching')
    .replace(/\b(?:all|every|both) (?:of your )?sources\b/gi, 'standard teaching')
    .replace(/\byour sources?(?: say| agree| list)?\b/gi, 'standard teaching');
  // 5. remaining bare references ("ATI Ch9 HOB ≥30°", "textbook Ch31 right side", "fits ATI’s …", "Correct: ATI Ch9 — …")
  t = t.replace(new RegExp(BARE + String.raw`\s*—\s*`, 'g'), M);
  t = t.replace(new RegExp(String.raw`(?<![\w’'#])` + BARE + String.raw`(?:\s*\/\s*` + BARE + String.raw`)*(?=[\s.;,:/]|$)[;,:]?\s*`, 'g'), M);
  // 6. tidy
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').replace(/([,;])\s*([.;])/g, '$2').replace(/\(\s*\)/g, '').replace(/;\s*\./g, '.');
  t = t.replace(/^[\s\u0001,;:—-]+/, M).replace(/(^|[.!?:]\s*)\u0001\s*([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase()).replace(/\u0001/g, '');
  t = t.replace(/\b[Tt]he standard teaching\b/g, 'standard teaching');
  t = t.replace(/^standard teaching/, 'Standard teaching').replace(/([.!?]\s+)standard teaching/g, '$1Standard teaching');
  t = t.replace(/\b[Yy]our standard teaching\b/g, 'Standard teaching');
  if (t !== s && /^[a-z]/.test(s) === false) t = t.replace(/^([a-z])(?=[a-z])/, c => c.toUpperCase());
  t = t.replace(/^[\s.;,]+$/, '');
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t ? lead + t + trail : '';
}
/** clean only when inside the mock exam */
export const useClean = () => { const on = useExamClean(); return (s: string | undefined) => (on ? cleanText(s) : s ?? ''); };

const KEEP = new Set(['id', 'fmt', 'src', 'refs', 'qa', 'caseId', 'cj', 'scoring', 'unit', 'topics']);
/** deep copy with every display string cleaned; ids, keys and source metadata are untouched */
export function cleanDeep<T>(v: T, key = ''): T {
  if (KEEP.has(key)) return v;
  if (typeof v === 'string') return cleanText(v) as unknown as T;
  if (Array.isArray(v)) return v.map(x => cleanDeep(x)) as unknown as T;
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = cleanDeep(x, k);
    return o as T;
  }
  return v;
}
const cache = new Map<unknown, unknown>();
/** memoized cleanDeep for static bank objects (items, cases) */
export function cleanItem<T>(v: T): T {
  if (!v) return v;
  if (!cache.has(v)) cache.set(v, cleanDeep(v));
  return cache.get(v) as T;
}
