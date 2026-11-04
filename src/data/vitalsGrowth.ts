/**
 * ❤️ Peds Vital Signs & Growth — Birth to 17 (source-locked, 10/30/2026).
 * Values come ONLY from the uploaded files and the student's own master sheet.
 * Growth-chart percentiles (WHO/CDC) are NOT in the sources; every place that would need them says so.
 */
import { S } from './rapid';
export const MS = 'Your master sheet (10/30)';

export type GroupId = 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school' | 'adolescent';
export interface Group { id: GroupId; name: string; ages: string; hr: string; rr: string; bpNote: string; color: string }
/** age bands as the student defined them; HR/RR from the ATI vital-sign notes */
export const GROUPS: Group[] = [
  { id: 'newborn', name: 'Newborn', ages: 'Birth–28 days', hr: '110–160', rr: '30–60', bpNote: 'Avg 70/50 (Ch31); 50th pct 64/41 (ATI)', color: 'g1' },
  { id: 'infant', name: 'Infant', ages: '1–11 months', hr: '90–160', rr: '25–60', bpNote: 'Avg 90/60 (Ch31); 50th pct 85/50 (ATI)', color: 'g2' },
  { id: 'toddler', name: 'Toddler', ages: '1–2 years', hr: '80–140', rr: '25–30', bpNote: '2 y avg 96/68 (Ch31)', color: 'g3' },
  { id: 'preschool', name: 'Preschool', ages: '3–5 years', hr: '70–120', rr: '20–25', bpNote: '4 y avg 100/70 (Ch31); routine BP from 3', color: 'g4' },
  { id: 'school', name: 'School-age', ages: '6–12 years', hr: '60–110', rr: '20–25', bpNote: '6 y 105/70 · 10 y 108/70 · 12 y 110/70 (Ch31)', color: 'g5' },
  { id: 'adolescent', name: 'Adolescent', ages: '13–17 years', hr: '50–100', rr: '16–20', bpNote: '16 y avg 120/70 (Ch31); ATI: <120/80', color: 'g6' },
];

/** selectable ages: birth, 1–11 months, 12 & 18 months, then 2–17 years */
export interface AgeOpt { key: string; label: string; months: number }
export const AGE_OPTIONS: AgeOpt[] = [
  { key: 'birth', label: 'Birth', months: 0 },
  ...Array.from({ length: 11 }, (_, i) => ({ key: `${i + 1}m`, label: `${i + 1} month${i ? 's' : ''}`, months: i + 1 })),
  { key: '12m', label: '12 months (1 year)', months: 12 },
  { key: '18m', label: '18 months', months: 18 },
  ...Array.from({ length: 16 }, (_, i) => ({ key: `${i + 2}y`, label: `${i + 2} years`, months: (i + 2) * 12 })),
];
export function groupOf(months: number): Group {
  if (months < 1) return GROUPS[0];
  if (months < 12) return GROUPS[1];
  if (months < 36) return GROUPS[2];
  if (months < 72) return GROUPS[3];
  if (months < 156) return GROUPS[4];
  return GROUPS[5];
}

/** Ch31 Table 31.3 AVERAGES (not limits) */
export const BP_AVG: { age: string; months: number; bp: string }[] = [
  { age: 'Newborn', months: 0, bp: '70/50' }, { age: '1–11 months', months: 6, bp: '90/60' }, { age: '2 years', months: 24, bp: '96/68' },
  { age: '4 years', months: 48, bp: '100/70' }, { age: '6 years', months: 72, bp: '105/70' }, { age: '10 years', months: 120, bp: '108/70' },
  { age: '12 years', months: 144, bp: '110/70' }, { age: '16 years', months: 192, bp: '120/70' },
];
/** ATI notes — 50th and 95th percentile columns, by sex where given */
export const BP_ATI: { age: string; p50: string; p95: string }[] = [
  { age: 'Newborn', p50: '64/41', p95: 'N/A' },
  { age: 'Infant', p50: '85/50', p95: 'N/A' },
  { age: 'Toddler 1–2 y', p50: 'M 85–91 / 37–46 · F 86–89 / 40–49', p95: 'M >103–109 / >56 · F >104–107 / 58–67' },
  { age: 'Preschool 3–5 y', p50: 'M 91–98 / 46–53 · F 89–93 / 49–54', p95: 'M >109–112 / 65–72 · F >107–110 / 67–72' },
  { age: 'School-age 6–12 y', p50: 'M 96–106 / 55–62 · F 94–105 / 56–62', p95: 'M >114–123 / 74–81 · F >111–129 / 74–80' },
  { age: 'Adolescent 13–18 y', p50: '<120/80', p95: 'N/A' },
];
/** Ch31 temperature averages °C; 7, 9 and 11 y as transcribed in the student's master sheet */
export const TEMP_AVG: { age: string; c: number; src: string }[] = [
  { age: '3 months', c: 37.5, src: S.T31 }, { age: '6 months', c: 37.5, src: S.T31 }, { age: '1 year', c: 37.7, src: S.T31 },
  { age: '3 years', c: 37.2, src: S.T31 }, { age: '5 years', c: 37.0, src: S.T31 }, { age: '7 years', c: 36.8, src: MS },
  { age: '9 years', c: 36.7, src: MS }, { age: '11 years', c: 36.7, src: MS }, { age: '13 years', c: 36.6, src: S.T31 },
];
export const cToF = (c: number) => Math.round((c * 9 / 5 + 32) * 10) / 10;
export const TEMP_REFS: { ref: string; value: string; src: string; flag?: string }[] = [
  { ref: 'General pediatric reference', value: '36.1–37.2 °C (97–99 °F)', src: S.ATIV, flag: 'Route not specified — not a universal range for every site.' },
  { ref: 'Oral, acceptable range (avg 37 °C)', value: '36–38 °C', src: S.ATI27 },
  { ref: 'Newborn', value: '36.5–37.5 °C', src: S.ATI27 },
  { ref: 'Average by about age 5', value: '37 °C (98.6 °F)', src: S.ATI27 },
  { ref: 'Route differences', value: 'Rectal ≈ 0.5 °C higher than oral; axillary ≈ 0.5 °C lower; temporal ≈ rectal', src: S.ATI27 },
  { ref: 'Fever concern', value: 'Fever is not harmful unless >39.4 °C (103 °F); hyperthermia >40 °C', src: S.ATI27 },
];
export const TEMP_ROUTES: { route: string; text: string; src: string; flag?: string }[] = [
  { route: 'Axillary / non-contact', text: 'Use first to reduce anxiety; tympanic or axillary preferred in infants and young children.', src: S.ATIV },
  { route: 'Oral', text: 'Older than 4 years (ATI); "when cooperative, about 5–6 years" (textbook). Wait 20–30 min after eating/drinking; not with mouth breathing.', src: S.ATI27, flag: 'Different age cut-offs (D4).' },
  { route: 'Rectal', text: 'Never under 1 month; not with diarrhea, bleeding risk, neutropenia/chemo. Infant supine with legs raised; older child side-lying.', src: S.ATI27 },
  { route: 'Tympanic', text: 'Not for infants 6 months or younger; pinna DOWN & back under 3 y, UP & back 3 y+; earwax alters the reading.', src: S.ATI27, flag: 'ATI vital-sign notes say "pull up" for all ages (D2).' },
  { route: 'Temporal', text: 'Reads close to rectal.', src: S.ATI27 },
];
export const SPO2: { text: string; src: string; flag?: string }[] = [
  { text: 'Expected 95% or above (ATI notes); 95–100% (ATI Ch27).', src: S.ATIV },
  { text: 'Exception in your sources: children with chronic lung disease may tolerate about 88%.', src: S.ATI27 },
  { text: 'Newborn transition just after birth and cyanotic heart disease are other exceptions.', src: MS, flag: 'From your master sheet — not found in the uploaded files.' },
  { text: 'Sensor: finger or toe; sole of the foot in infants; nonedematous site; dark nail polish interferes.', src: S.ATI27 },
  { text: 'Assess the whole child: retractions, flaring, grunting, cyanosis, lethargy, apnea can be present before SpO₂ drops.', src: S.L107 },
];

/* ------------------------------------------------------------------ GROWTH RULES */
export interface Rule { age: string; text: string; src: string; flag?: string }
export const WEIGHT_RULES: Rule[] = [
  { age: '0–6 months', text: 'Gains about 1.5 lb (≈0.68 kg) per month.', src: S.ATIM },
  { age: 'About 5–6 months', text: 'Birth weight doubles — "by 5–6 months" (textbook) / "6 months" (course PowerPoint, lecture).', src: S.T31, flag: 'Doubling timeframe verified: textbook 5–6 mo, slides & lecture 6 mo.' },
  { age: '6–12 months', text: 'Gains about 0.75 lb (≈0.34 kg) per month.', src: S.ATIM },
  { age: '12 months', text: 'Birth weight triples.', src: S.PPTB },
  { age: '1–3 years', text: 'Gains about 5 lb/year (textbook overview); growth slows; physiologic anorexia.', src: S.T31 },
  { age: '30 months – 3 years', text: 'Birth weight ×4 — ATI: about 30 months; textbook: by 3 years.', src: S.ATIM, flag: 'Two sources, two ages.' },
  { age: '3–5 (6) years', text: 'Gains about 5 lb/year.', src: S.ATIM },
  { age: '6–12 years', text: 'About 4.4–6.6 lb (2–3 kg) per year.', src: S.ATI6, flag: 'ATI milestone reference says 4.4–8.8 lb/yr (D7) — both kept.' },
  { age: '13–17 years', text: 'Pubertal growth spurt; timing varies. No annual weight-gain range is given in your sources.', src: S.ATIM },
];
export const HEIGHT_RULES: Rule[] = [
  { age: 'First 6 months', text: 'About 1 inch/month (ATI) · 18–22 cm/yr rate at 1–6 mo (textbook).', src: S.ATIM },
  { age: '6–12 months', text: 'About 0.5 inch/month (ATI) · 14–18 cm/yr rate (textbook).', src: S.ATIM },
  { age: '12 months', text: 'Length about 50% greater than birth length.', src: S.PPTB },
  { age: '2nd year', text: 'About 11 cm (4.4 in).', src: S.T31 },
  { age: 'Toddler', text: 'About 3 in/year (ATI); textbook: 3rd year 8 cm, 4th year 7 cm.', src: S.ATIM },
  { age: 'Preschool', text: 'About 2.5–3 in/year.', src: S.ATIM },
  { age: '5–10 years', text: '5–6 cm (2–2.4 in)/year (textbook) · school-age 6–7 cm (2.4–2.8 in)/year (ATI Ch6) · "~2 in/yr" (ATI milestones).', src: S.T31 },
  { age: 'Adolescence', text: 'Girls reach adult height about 13, boys about 15; growth spurt with puberty.', src: S.ATIM },
];
export const HEAD_RULES: Rule[] = [
  { age: 'First 6 months', text: 'Head circumference grows about 0.5 inch/month.', src: S.ATIM },
  { age: 'To 36 months', text: 'Measured routinely; tape just above the eyebrows and pinna, around the occiput.', src: S.T31 },
  { age: 'Fontanels', text: 'Posterior closes 2–3 months; anterior 12–18 months.', src: S.PPTB },
  { age: 'Red flag', text: 'Crossing ≥1 grid line in 2–4 weeks suggests hydrocephalus; bulging fontanel; setting-sun eyes.', src: S.T32 },
];

/** what a "weight chart by age" can honestly show from these sources */
export interface WeightRow { key: string; label: string; months: number; rule: string; src: string }
const WROW = (key: string, label: string, months: number, rule: string, src: string): WeightRow => ({ key, label, months, rule, src });
export const WEIGHT_ROWS: WeightRow[] = [
  WROW('birth', 'Birth', 0, 'Starting point — record measured birth weight', S.L930),
  ...[1, 2, 3, 4, 5].map(m => WROW(`${m}m`, `${m} month${m > 1 ? 's' : ''}`, m, `Birth weight + about ${(1.5 * m).toFixed(1)} lb (1.5 lb/mo)`, S.ATIM)),
  WROW('6m', '6 months', 6, '≈ 2 × birth weight (also birth + ~9 lb by the monthly rule)', S.PPTB),
  ...[7, 8, 9, 10, 11].map(m => WROW(`${m}m`, `${m} months`, m, `6-month weight + about ${(0.75 * (m - 6)).toFixed(2)} lb (0.75 lb/mo)`, S.ATIM)),
  WROW('12m', '12 months', 12, '≈ 3 × birth weight', S.PPTB),
  WROW('18m', '18 months', 18, '12-month weight + growth slowing (~5 lb/yr toddler rate)', S.T31),
  WROW('2y', '2 years', 24, '12-month weight + ~5 lb', S.T31),
  WROW('3y', '3 years', 36, '≈ 4 × birth weight (textbook) — ATI places ×4 at ~30 months', S.T31),
  ...[4, 5].map(y => WROW(`${y}y`, `${y} years`, y * 12, '+ about 5 lb per year', S.ATIM)),
  ...[6, 7, 8, 9, 10, 11, 12].map(y => WROW(`${y}y`, `${y} years`, y * 12, '+ 4.4–6.6 lb/yr (ATI Ch6) · 4.4–8.8 lb/yr (ATI milestones)', S.ATI6)),
  ...[13, 14, 15, 16, 17].map(y => WROW(`${y}y`, `${y} years`, y * 12, 'Pubertal spurt — highly individual; interpret with height and puberty stage', S.ATIM)),
];
/** rule-based estimate (lb) from a measured birth weight — teaching only, never a norm */
export function ruleEstimate(birthLb: number, months: number): { low: number; high: number } | null {
  if (months <= 6) { const v = birthLb + 1.5 * months; return { low: v, high: months === 6 ? Math.max(v, birthLb * 2) : v }; }
  if (months <= 12) { const six = birthLb + 9; const v = six + 0.75 * (months - 6); return { low: Math.min(v, birthLb * 3), high: Math.max(v, months === 12 ? birthLb * 3 : v) }; }
  if (months <= 36) { const t = birthLb * 3; const y = (months - 12) / 12; return { low: t + 5 * y, high: months >= 30 ? Math.max(t + 5 * y, birthLb * 4) : t + 5 * y }; }
  return null;
}
export const lbToKg = (lb: number) => Math.round((lb / 2.2) * 10) / 10;
export const kgToLb = (kg: number) => Math.round(kg * 2.2 * 10) / 10;

export const GAPS: string[] = [
  'Median weight, length/height, and head circumference by exact age — not in your uploaded files.',
  'Separate boy/girl weight or height values and weight-for-age, length-for-age, weight-for-length, BMI-for-age, or head-circumference percentile curves — not in your uploaded files (WHO/CDC charts were not authorized).',
  'BMI "underweight below the 5th percentile" — not in your files (Ch30 gives only overweight 85th–95th, obese >95th, extremely obese 99th).',
  'Expected newborn weight loss and time to regain birth weight — not in your uploaded files.',
  'Numeric "emergency" heart-rate, respiratory-rate, or hypotension cut-offs — not in your files (PALS-style values are in the separate Source vs Current panel only).',
  'Adolescent BP categories (elevated / stage 1 / stage 2) — not in your files; ATI gives only "<120/80" and the flagged ">90th percentile × 3" statement.',
];

export const BMI: Rule[] = [
  { age: 'Overweight', text: 'BMI 85th to 95th percentile.', src: S.T30 },
  { age: 'Obese', text: 'BMI above the 95th percentile.', src: S.T30 },
  { age: 'Extremely obese', text: 'BMI at the 99th percentile.', src: S.T30 },
  { age: 'Underweight', text: 'Not defined in your uploaded sources.', src: S.T30, flag: 'Gap — needs an outside reference.' },
  { age: 'Why percentiles, not adult BMI', text: 'Your sources classify children by BMI PERCENTILE, not adult BMI numbers, and percentile charts are read for the PATTERN over time. During puberty one BMI value is only a screen, not a diagnosis.', src: S.T30 },
  { age: 'Activity & obesity', text: 'Under 5: active throughout the day; 6–17: ≥60 min/day; lifestyle change before medication; family habits, not dieting.', src: S.T30 },
];

export const CHART_LESSON: Rule[] = [
  { age: 'Percentiles track a pattern', text: 'A growth chart shows where a child is compared with peers AND whether the child keeps following a curve. The trend matters more than one dot.', src: S.L930 },
  { age: '50th percentile', text: 'The 50th percentile is the middle (median) value: half of children are above, half below. A child on the 20th or 80th percentile who follows the curve can be perfectly healthy.', src: S.L930 },
  { age: 'High or low', text: '95th percentile weight → educate the parents (nutrition, activity). 5th percentile → think malnutrition, possible neglect/abuse, illness → educate and assess.', src: S.L930 },
  { age: 'Investigate when…', text: 'Height and weight percentiles are widely different, the child fails to reach expected growth, or there is a sudden change.', src: S.T31 },
  { age: 'Head circumference', text: 'Crossing ≥1 grid line in 2–4 weeks suggests hydrocephalus.', src: S.T32 },
  { age: 'Chart types', text: 'Weight-for-age, length-for-age (lying, until 2 y), height-for-age (standing), weight-for-length, BMI-for-age (≥2 y), head circumference-for-age (to 36 mo), and growth velocity (rate of change). Your sources name CDC percentile charts; the specific WHO-vs-CDC age split is not in them.', src: S.PPTB },
];

export const MEASURE: Rule[] = [
  { age: 'Weight', text: 'Same scale, same time of day; infant naked or in a clean dry diaper; zero/balance the scale; warm room; never leave the infant unattended on the scale; older children in underwear/light gown with privacy.', src: S.T31 },
  { age: 'Length', text: 'Supine (recumbent) until 2 years; an assistant holds the head midline; mark head and heel, then measure.', src: S.L930 },
  { age: 'Record in kg', text: 'Weigh in kg for medication doses (lb ÷ 2.2). A second nurse checks calculated pediatric doses; question any dose outside the safe range.', src: S.T31 },
  { age: 'Diaper weights', text: '1 g of diaper weight = 1 mL of urine (wet − dry).', src: S.T31 },
];
