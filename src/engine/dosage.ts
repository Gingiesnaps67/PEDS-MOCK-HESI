// Pediatric dosage calculation generator. Every drug value below is a commonly published
// pediatric dose; each drug lists its reference. Values are for practice math only.
import type { Item, NumericItem, MCItem } from '../types';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

interface Drug {
  name: string; route: 'PO' | 'IV';
  basis: 'dose' | 'day';
  mgPerKg: number; lowPerKg: number; highPerKg: number;
  dosesPerDay: number; freq: string;
  concMg: number; concMl: number; form: string;
  maxSingleMg?: number; maxDayMg?: number;
  kg: [number, number]; ref: string;
}

export const DRUGS: Drug[] = [
  { name: 'Acetaminophen', route: 'PO', basis: 'dose', mgPerKg: 15, lowPerKg: 10, highPerKg: 15, dosesPerDay: 4, freq: 'every 6 hours', concMg: 160, concMl: 5, form: 'oral suspension', maxSingleMg: 1000, maxDayMg: 4000, kg: [6, 30], ref: 'Acetaminophen 10–15 mg/kg/dose, max 75 mg/kg/day (AAP/FDA labeling)' },
  { name: 'Ibuprofen', route: 'PO', basis: 'dose', mgPerKg: 10, lowPerKg: 5, highPerKg: 10, dosesPerDay: 3, freq: 'every 8 hours', concMg: 100, concMl: 5, form: 'oral suspension', maxSingleMg: 400, maxDayMg: 1200, kg: [7, 35], ref: 'Ibuprofen 5–10 mg/kg/dose every 6–8 h, max 40 mg/kg/day (OTC pediatric labeling)' },
  { name: 'Amoxicillin', route: 'PO', basis: 'day', mgPerKg: 90, lowPerKg: 80, highPerKg: 90, dosesPerDay: 2, freq: 'divided every 12 hours', concMg: 400, concMl: 5, form: 'oral suspension', maxDayMg: 4000, kg: [8, 40], ref: 'Amoxicillin high-dose 80–90 mg/kg/day divided q12h for acute otitis media (AAP 2013)' },
  { name: 'Cephalexin', route: 'PO', basis: 'day', mgPerKg: 50, lowPerKg: 25, highPerKg: 50, dosesPerDay: 4, freq: 'divided every 6 hours', concMg: 250, concMl: 5, form: 'oral suspension', maxDayMg: 4000, kg: [8, 40], ref: 'Cephalexin 25–50 mg/kg/day divided (product labeling)' },
  { name: 'Prednisolone', route: 'PO', basis: 'day', mgPerKg: 2, lowPerKg: 1, highPerKg: 2, dosesPerDay: 1, freq: 'once daily', concMg: 15, concMl: 5, form: 'oral solution', maxDayMg: 60, kg: [8, 30], ref: 'Prednisolone 1–2 mg/kg/day (max 60 mg) for asthma exacerbation (NAEPP EPR-3)' },
  { name: 'Ondansetron', route: 'IV', basis: 'dose', mgPerKg: 0.15, lowPerKg: 0.1, highPerKg: 0.15, dosesPerDay: 3, freq: 'every 8 hours', concMg: 2, concMl: 1, form: 'injection', maxSingleMg: 4, kg: [8, 26], ref: 'Ondansetron 0.1–0.15 mg/kg/dose IV, max 4 mg (product labeling, pediatric)' },
  { name: 'Morphine', route: 'IV', basis: 'dose', mgPerKg: 0.1, lowPerKg: 0.05, highPerKg: 0.1, dosesPerDay: 6, freq: 'every 4 hours as needed', concMg: 4, concMl: 1, form: 'injection', maxSingleMg: 4, kg: [10, 40], ref: 'Morphine 0.05–0.1 mg/kg/dose IV (NHLBI 2014; pediatric references)' },
];

export type DosageKind = 'perDose' | 'perDay' | 'safety' | 'maintenance' | 'urine' | 'convert' | 'infusion';
export const DOSAGE_KINDS: { id: DosageKind; label: string }[] = [
  { id: 'convert', label: 'Pounds to kilograms' },
  { id: 'perDose', label: 'mg/kg/dose → mL' },
  { id: 'perDay', label: 'mg/kg/day divided → mL' },
  { id: 'safety', label: 'Safe-dose range check' },
  { id: 'maintenance', label: 'Maintenance IV fluids (mL/hr)' },
  { id: 'urine', label: 'Minimum urine output' },
  { id: 'infusion', label: 'IV infusion rate' },
];

/** Holliday-Segar daily maintenance volume */
export function maintenanceDaily(kg: number): number {
  if (kg <= 10) return 100 * kg;
  if (kg <= 20) return 1000 + 50 * (kg - 10);
  return 1500 + 20 * (kg - 20);
}

const base = (id: string, stem: string) => ({ id, topics: [34], cj: 'act' as const, diff: 2 as const, stem, src: ['Instructor HESI Review #34'], qa: 'reviewed' as const });

function dose(d: Drug, kg: number) {
  const perDayTotal = d.basis === 'day' ? d.mgPerKg * kg : d.mgPerKg * kg * d.dosesPerDay;
  let perDose = d.basis === 'day' ? perDayTotal / d.dosesPerDay : d.mgPerKg * kg;
  if (d.maxSingleMg) perDose = Math.min(perDose, d.maxSingleMg);
  return { perDose, perDayTotal };
}

export function generate(kind: DosageKind, seed: number, n: number): Item {
  const r = rng(seed * 7919 + n);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const id = `G-${kind}-${seed}-${n}`;
  if (kind === 'convert') {
    const lb = round(10 + r() * 80, 1);
    const kg = round(lb / 2.2, 1);
    return { ...base(id, `A child weighs ${lb} lb. What is the child’s weight in kilograms? (Round to the nearest tenth.)`), fmt: 'numeric', unit: 'kg', answer: kg, tolerance: 0.05, decimals: 1,
      steps: [`${lb} lb ÷ 2.2 = ${round(lb / 2.2, 3)} kg`, `Rounded: ${kg} kg`],
      rationale: { correct: 'Divide pounds by 2.2 to get kilograms. All pediatric weight-based dosing starts here.', priority: 'Accurate weight', clue: 'kg is always the smaller number.', memory: 'Pounds are bigger numbers — divide to shrink to kg.' } } satisfies NumericItem;
  }
  if (kind === 'maintenance') {
    const kg = Math.round(4 + r() * 36);
    const daily = maintenanceDaily(kg);
    const hr = round(daily / 24, 0);
    const steps = kg <= 10 ? [`First 10 kg: 100 mL × ${kg} = ${daily} mL/day`]
      : kg <= 20 ? ['First 10 kg: 1,000 mL', `Next ${kg - 10} kg × 50 mL = ${50 * (kg - 10)} mL`, `Total ${daily} mL/day`]
      : ['First 10 kg: 1,000 mL', 'Next 10 kg: 500 mL', `Remaining ${kg - 20} kg × 20 mL = ${20 * (kg - 20)} mL`, `Total ${daily} mL/day`];
    return { ...base(id, `Calculate the hourly maintenance IV rate for a child weighing ${kg} kg using the Holliday-Segar (100/50/20) method. (Round to the nearest whole mL/hr.)`), diff: 3, fmt: 'numeric', unit: 'mL/hr', answer: hr, tolerance: 1, decimals: 0,
      steps: [...steps, `${daily} ÷ 24 = ${round(daily / 24, 2)} → ${hr} mL/hr`],
      rationale: { correct: '100 mL/kg for the first 10 kg, 50 mL/kg for the next 10 kg, 20 mL/kg for each kg above 20 — per day, then ÷ 24.', priority: 'Fluid balance', clue: 'Calculate per day first, then divide by 24.', memory: '4-2-1 rule gives the same answer per hour.' }, refs: ['Holliday & Segar, Pediatrics 1957'] } satisfies NumericItem;
  }
  if (kind === 'urine') {
    const kg = round(3 + r() * 30, 1);
    const hrs = pick([4, 6, 8, 12]);
    const ans = round(kg * 1 * hrs, 1);
    return { ...base(id, `A child weighing ${kg} kg must maintain a urine output of at least 1 mL/kg/hr. What is the minimum acceptable output over ${hrs} hours?`), fmt: 'numeric', unit: 'mL', answer: ans, tolerance: 0.5, decimals: 1,
      steps: [`${kg} kg × 1 mL/kg/hr = ${kg} mL/hr`, `${kg} mL/hr × ${hrs} hr = ${ans} mL`],
      rationale: { correct: 'Minimum pediatric urine output is commonly 1 mL/kg/hr (infants often 1–2 mL/kg/hr). Multiply by hours.', priority: 'Perfusion and hydration', clue: 'Rate × time.' } } satisfies NumericItem;
  }
  if (kind === 'infusion') {
    const vol = pick([100, 150, 250, 500]);
    const hrs = pick([2, 4, 6, 8]);
    const ans = round(vol / hrs, 0);
    return { ...base(id, `${vol} mL of IV fluid is to infuse over ${hrs} hours by infusion pump. At what rate should the nurse set the pump? (Round to the nearest whole mL/hr.)`), fmt: 'numeric', unit: 'mL/hr', answer: ans, tolerance: 0.5, decimals: 0,
      steps: [`${vol} mL ÷ ${hrs} hr = ${round(vol / hrs, 2)} → ${ans} mL/hr`],
      rationale: { correct: 'Volume ÷ time. Pediatric IV fluids always run on a pump.', priority: 'Preventing fluid overload', clue: 'mL/hr = mL ÷ hr.' } } satisfies NumericItem;
  }
  const pool = kind === 'perDose' ? DRUGS.filter(d => d.basis === 'dose') : kind === 'perDay' ? DRUGS.filter(d => d.basis === 'day') : DRUGS;
  const d = pick(pool);
  const kg = Math.round(d.kg[0] + r() * (d.kg[1] - d.kg[0]));
  const lb = round(kg * 2.2, 1);
  const { perDose, perDayTotal } = dose(d, kg);
  const mgD = round(perDose, 2);
  const ml = round(perDose / d.concMg * d.concMl, 1);
  const orderTxt = d.basis === 'day' ? `${d.mgPerKg} mg/kg/day ${d.route} ${d.freq}` : `${d.mgPerKg} mg/kg/dose ${d.route} ${d.freq}`;
  if (kind === 'perDose' || kind === 'perDay') {
    const capped = d.maxSingleMg && d.basis === 'dose' && d.mgPerKg * kg > d.maxSingleMg;
    const steps = [`${lb} lb ÷ 2.2 = ${kg} kg`];
    if (d.basis === 'day') steps.push(`${d.mgPerKg} mg/kg/day × ${kg} kg = ${round(perDayTotal, 2)} mg/day`, `${round(perDayTotal, 2)} mg ÷ ${d.dosesPerDay} doses = ${mgD} mg/dose`);
    else steps.push(`${d.mgPerKg} mg/kg × ${kg} kg = ${round(d.mgPerKg * kg, 2)} mg/dose${capped ? ` → capped at the ${d.maxSingleMg} mg maximum single dose` : ''}`);
    steps.push(`${mgD} mg ÷ ${d.concMg} mg × ${d.concMl} mL = ${round(perDose / d.concMg * d.concMl, 3)} → ${ml} mL`);
    return { ...base(id, `A child weighing ${lb} lb is prescribed ${d.name.toLowerCase()} ${orderTxt}${capped ? ` (maximum ${d.maxSingleMg} mg per dose)` : ''}. Available: ${d.name.toLowerCase()} ${d.form} ${d.concMg} mg/${d.concMl} mL. How many mL should the nurse give per dose? (Round to the nearest tenth.)`), diff: d.basis === 'day' ? 3 : 2, fmt: 'numeric', unit: 'mL', answer: ml, tolerance: 0.1, decimals: 1,
      steps, refs: [d.ref],
      rationale: { correct: d.basis === 'day' ? 'mg/kg/DAY: find the daily total, divide by the number of doses, then convert to mL.' : 'mg/kg/DOSE: multiply by weight for each dose — do not divide again — then convert to mL.', priority: 'Weight-based dosing accuracy', clue: d.basis === 'day' ? '"/day" means divide.' : '"/dose" means do not divide.', memory: 'K-D-V: Kilograms, Dose, Volume.' } } satisfies NumericItem;
  }
  // safety check: order is safe, too high, or too low
  const variant = pick(['safe', 'high', 'low'] as const);
  const factor = variant === 'safe' ? (d.lowPerKg + (0.15 + r() * 0.7) * (d.highPerKg - d.lowPerKg)) : variant === 'high' ? d.highPerKg * (1.5 + r() * 0.8) : d.lowPerKg * (0.3 + r() * 0.3);
  const unit = d.basis === 'day' ? 'per day' : 'per dose';
  const orderedDose = d.basis === 'day' ? round(factor * kg / d.dosesPerDay, 0) : round(factor * kg, d.mgPerKg < 1 ? 1 : 0);
  const orderedTotal = d.basis === 'day' ? orderedDose * d.dosesPerDay : orderedDose;
  const lowT = round(d.lowPerKg * kg, 1), highT = round(d.highPerKg * kg, 1);
  const verdict = orderedTotal > highT + 1e-6 ? 2 : orderedTotal < lowT - 1e-6 ? 1 : 0;
  const options = ['The dose is within the safe range — give as prescribed', 'The dose is below the therapeutic range — clarify with the prescriber', 'The dose exceeds the safe range — hold and clarify with the prescriber'];
  return { ...base(id, `A child weighing ${kg} kg is prescribed ${d.name.toLowerCase()} ${orderedDose} mg ${d.route} ${d.freq}. The safe range is ${d.lowPerKg}–${d.highPerKg} mg/kg ${unit === 'per day' ? '/day' : '/dose'}. What should the nurse conclude?`), diff: 3, cj: 'analyze', fmt: 'mc',
    options, answer: verdict, refs: [d.ref],
    rationale: {
      correct: `Safe range ${unit}: ${d.lowPerKg} × ${kg} = ${lowT} mg to ${d.highPerKg} × ${kg} = ${highT} mg. Ordered ${unit}: ${d.basis === 'day' ? `${orderedDose} mg × ${d.dosesPerDay} doses = ${orderedTotal} mg` : `${orderedTotal} mg`}. ${verdict === 0 ? 'Within range.' : verdict === 1 ? 'Below range — may be ineffective.' : 'Above range — potential overdose.'}`,
      options: ['Only when the ordered amount falls between the low and high limits.', 'An under-dose can leave infection or pain untreated.', 'An overdose must never be given; clarify first.'],
      priority: 'Medication safety', clue: d.basis === 'day' ? 'Compare the DAILY total to a per-day range.' : 'Compare one dose to a per-dose range.',
    } } satisfies MCItem;
}

export function generateSet(kinds: DosageKind[], count: number, seed: number): Item[] {
  const out: Item[] = [];
  for (let n = 0; n < count; n++) out.push(generate(kinds[n % kinds.length], seed, n));
  return out;
}
