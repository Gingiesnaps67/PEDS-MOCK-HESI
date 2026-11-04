/**
 * Rapid Review Center data — SOURCE-LOCKED (10/30/2026 directive).
 * Every entry carries the uploaded source it came from. Where sources disagree, each source is shown
 * separately and the disagreement is logged (DISCREPANCIES). Outside information appears ONLY in
 * CURRENT_GUIDANCE, which is never used in lessons, answer keys, or scored items.
 */
export const S = {
  ATIV: 'ATI notes: Pediatric vital signs',
  ATI27: 'ATI reading: Vital Signs (Ch27)',
  ATI6: 'ATI reading: School-age (Ch6)',
  ATI9: 'ATI reading: Enteral Nutrition (Ch9)',
  ATI11: 'ATI reading: Infection Control (Ch11)',
  ATI19: 'ATI reading: BP medications (Ch19)',
  ATI22: 'ATI reading: GI disorders (Ch22)',
  ATI1: 'ATI reading: Leading & Managing (Ch1)',
  ATIM: 'ATI reference: Developmental milestones',
  PPTB: 'Course PowerPoint: Basic Peds Nursing Care',
  PPTH: 'Course PowerPoint: Health Promotion 2026',
  PPTP: 'Course PowerPoint: Physical Disorders 2026',
  REV: 'Instructor HESI Review 2026',
  L930: 'Lecture 09/30', L107: 'Lecture 10/07', L108: 'Lecture 10/08',
  T30: 'Textbook Ch30', T31: 'Textbook Ch31', T32: 'Textbook Ch32',
} as const;

export interface Sourced { text: string; src: string; flag?: string }
const x = (text: string, src: string, flag?: string): Sourced => (flag ? { text, src, flag } : { text, src });

/* ------------------------------------------------------------------ VITAL SIGNS */
export interface VitalRow { age: string; hr?: string; rr?: string; bp?: string }
export interface VitalTable { id: string; title: string; src: string; kind: 'range' | 'average'; note?: string; rows: VitalRow[] }

export const VITAL_TABLES: VitalTable[] = [
  { id: 'ati', title: 'Expected ranges', src: S.ATIV, kind: 'range',
    note: 'SpO₂ expected 95% or above. BP column = 50th-percentile values from the same notes.',
    rows: [
      { age: 'Newborn (birth–4 wk)', hr: '110–160', rr: '30–60', bp: '64/41' },
      { age: 'Infant (1–12 mo)', hr: '90–160', rr: '25–60', bp: '85/50' },
      { age: 'Toddler (1–2 y)', hr: '80–140', rr: '25–30', bp: 'SBP 85–91 (M) / 86–89 (F)' },
      { age: 'Preschool (3–5 y)', hr: '70–120', rr: '20–25', bp: 'SBP 91–98 (M) / 89–93 (F)' },
      { age: 'School age (6–12 y)', hr: '60–110', rr: '20–25', bp: 'SBP 96–106 (M) / 94–105 (F)' },
      { age: 'Adolescent (13–18 y)', hr: '50–100', rr: '16–20', bp: '<120/80' },
    ] },
  { id: 'ppt', title: 'Course PowerPoint table', src: S.PPTB, kind: 'range',
    note: 'Instructor corrected the newborn HR to 110–160 in the 09/30 lecture. The slide has no preschool row.',
    rows: [
      { age: 'Newborn', hr: '110–160 (corrected)', rr: '30–60', bp: '60–80 / 40–50' },
      { age: 'Infant', hr: '100–150', rr: '25–40', bp: '70–100 / 50–65' },
      { age: 'Toddler', hr: '90–140', rr: '20–30', bp: '80–110 / 55–75' },
      { age: 'School age', hr: '75–120', rr: '18–30', bp: '90–120 / 60–80' },
      { age: 'Adolescent', hr: '60–100', rr: '12–20', bp: '110–130 / 65–85' },
    ] },
  { id: 'tb', title: 'Textbook Table 31.3 — AVERAGES (not ranges)', src: S.T31, kind: 'average',
    note: 'Single average values. Do not read them as normal limits.',
    rows: [
      { age: 'Newborn', hr: '120', rr: '35', bp: '70/50' }, { age: '1–11 mo', hr: '120', rr: '30', bp: '90/60' },
      { age: '2 y', hr: '110', rr: '25', bp: '96/68' }, { age: '4 y', hr: '100', rr: '23', bp: '100/70' },
      { age: '6 y', hr: '100', rr: '21', bp: '105/70' }, { age: '10 y', hr: '90', rr: '20', bp: '108/70' },
      { age: '12 y', hr: '88', rr: '20', bp: '110/70' }, { age: '16 y', hr: '70', rr: '20', bp: '120/70' },
    ] },
];

/** what to DO — technique rules, each with its source */
export const VITAL_TECHNIQUE: { area: string; items: Sourced[] }[] = [
  { area: 'Order & approach', items: [
    x('Infant order: respirations FIRST (before disturbing), pulse second, temperature LAST.', S.T31),
    x('Assess when calm; pain, anxiety, and crying raise the pulse.', S.ATIV),
  ] },
  { area: 'Respirations', items: [
    x('Count for a FULL minute; infants are abdominal (diaphragmatic) breathers — watch the belly.', S.L930),
    x('Newborn/infant rhythm is normally irregular; older children regular.', S.ATIV),
    x('Apnea under 15 seconds during REM sleep can be normal in newborns.', S.ATI27),
  ] },
  { area: 'Pulse', items: [
    x('Apical pulse preferred under age 5.', S.PPTB),
    x('Count 1 full minute; apical at 5th intercostal space, left.', S.T31),
    x('Rapid infant check: brachial or femoral pulse.', S.ATIV),
  ] },
  { area: 'Temperature', items: [
    x('Use axillary or non-contact first to reduce anxiety.', S.ATIV),
    x('No rectal temperatures under 1 month.', S.ATI27),
    x('Tympanic: not for infants 6 months or younger; pull pinna DOWN & BACK under 3 y, UP & BACK 3 y and older.', S.ATI27),
    x('Tympanic: "gently pull the outer ear up" (one direction for all ages).', S.ATIV, 'Conflicts with the age-split rule in ATI Ch27 and textbook Ch31 — see Discrepancy D2.'),
    x('Oral: older than 4 years.', S.ATIV),
    x('Oral when cooperative, about 5–6 years.', S.T31, 'Different cut-off from ATI (>4 y) — see D4.'),
  ] },
  { area: 'Blood pressure', items: [
    x('Routine from age 3 (earlier if cardiac or critical concerns).', S.PPTB),
    x('Automated device preferred for newborns, infants, and some conditions; confirm extreme automated readings by auscultation.', S.ATIV),
    x('Cuff covers about two-thirds of the upper arm; if the right size is unavailable use OVERSIZED, never undersized; never choose by the label name.', S.T31),
    x('Cuff width about 40% of arm circumference; too small = falsely HIGH, too large = falsely LOW.', S.ATI27),
    x('Arm supported at heart level; never on a limb with an IV.', S.ATI27),
    x('Measure BP BEFORE anxiety-producing procedures; parent’s lap; explain as an "arm hug."', S.T31),
    x('Hypertension "after three readings above the 90th percentile."', S.ATIV, 'Flagged by you and in the Discrepancy Log (D8): not used for scoring.'),
  ] },
  { area: 'Oxygen saturation', items: [
    x('Expected 95% or above; sensor on finger or toe (sole of foot in infants).', S.ATIV),
  ] },
];

/** source-stated warning signs (sources give few numeric emergency cut-offs, so these are the red flags they DO state) */
export const VITAL_RED_FLAGS: Sourced[] = [
  x('Quieter breath sounds in an asthma attack can mean LESS air movement ("silent chest"), not improvement.', S.REV),
  x('Retractions, nasal flaring, grunting = respiratory distress in children ("choose retractions").', S.L107),
  x('Arm BP higher than leg BP, weak/delayed femoral pulses = coarctation.', S.PPTP),
  x('Post-tonsillectomy: frequent swallowing, rising pulse (>120), pallor = bleeding.', S.T32),
  x('Crying, fever, and feeding raise RR — but never dismiss distress as "just upset"; compare to age range and baseline.', S.REV),
  x('Fewer than 6 wet diapers a day, sunken fontanel, no tears = dehydration.', S.L107),
  x('Restlessness and tachycardia are early signs of hypoxia (croup/epiglottitis).', S.T32),
  x('Hypotension is a LATE sign of shock after tonsillectomy hemorrhage.', S.T32),
];

/* ------------------------------------------------------------------ SAFETY & CAR SEATS */
export const CAR_SEAT: { step: string; detail: string; src: string; flag?: string }[] = [
  { step: '1. Rear-facing', detail: 'From birth until AT LEAST age 2 — longer is safer, up to the seat’s limits. Never in front of an active airbag.', src: S.PPTH },
  { step: '2. Forward-facing with 5-point harness', detail: 'After outgrowing rear-facing; keep the harness as long as possible.', src: S.PPTH },
  { step: '3. Booster seat', detail: 'Until the seat belt fits — usually 4’9″ and 8–12 years.', src: S.PPTH },
  { step: '4. Seat belt', detail: 'Lap belt LOW on the hips (below hip bones), shoulder belt across the chest — never under the arm or behind the back.', src: S.PPTH },
  { step: 'Back seat', detail: 'Children under 12–13 ride in the back seat.', src: S.T30, flag: 'Course PowerPoint says "back seat only"; textbook and ATI say until 12 (D29).' },
  { step: 'State law note', detail: 'California law: rear-facing until 2; NCLEX-style items may say rear-facing until 40 lb; booster height ~4’9″.', src: S.L930 },
  { step: 'Textbook conflict', detail: 'Ch30 says rear-facing until 2 y in one box and "birth to 20 lb" in another.', src: S.T30, flag: 'Internal conflict (D29) — follow the instructor deck: rear-facing at least to age 2.' },
];

export const SAFETY_BY_AGE: { age: string; why: string; items: Sourced[] }[] = [
  { age: 'Newborn–6 mo', why: 'Cannot move away from hazards; starts rolling at 4–5 months.', items: [
    x('Back to sleep, firm mattress, no pillows/quilts/stuffed animals; no bed-sharing; don’t overheat; pacifier at sleep.', S.T32),
    x('Never leave on a raised surface — one hand on the baby (rolling begins 4–5 mo).', S.T31),
    x('Never prop a bottle; test bath water; no hot liquids while holding the baby.', S.T31),
    x('Rear-facing car seat in the back seat.', S.PPTH),
  ] },
  { age: '7–12 mo', why: 'Crawls, pulls to stand, pincer grasp → explores with hands and mouth.', items: [
    x('Gates at top and bottom of stairs; fireplace guards.', S.T31),
    x('No popcorn, hard candy, gum, hot dogs, nuts; no balloons or plastic bags.', S.T31),
    x('Lock medicines and cleaners; Poison Control number in the phone.', S.T30),
    x('Never unattended in a high chair, bed, or tub.', S.T31),
  ] },
  { age: 'Toddler 1–3 y', why: 'Mobile, curious, no sense of danger; poisoning risk peaks at 1–2 y.', items: [
    x('Drowning: never alone in tub or wading pool; fence pools; swim classes.', S.T31),
    x('Poisoning: highest risk ages 1–2 — lock everything; never call medicine "candy"; no ipecac/inducing vomiting.', S.T30),
    x('Burns: pot handles turned in; water heater ≤120 °F (49 °C); outlet covers.', S.PPTH),
    x('Choking: grapes, hot dogs, nuts, popcorn, coins, balloons, buttons, medication-syringe caps.', S.T30),
  ] },
  { age: 'Preschool 3–6 y', why: 'Imaginative, imitates adults, rides tricycles.', items: [
    x('Playground and tricycle supervision; helmets.', S.T31),
    x('Teach name, address, phone; stranger safety; never touch guns.', S.T31),
    x('Fire drills; stop-drop-roll; teach "nine-one-one."', S.T30),
  ] },
  { age: 'School age 6–12 y', why: 'Peers, bikes, sports, more time away from parents.', items: [
    x('Helmets and pads; bike safety; protective sports gear.', S.T31),
    x('Firearms locked; swim lessons; check water depth.', S.ATI6),
    x('Booster until the belt fits; back seat until 12; bus safety (stand 10 ft from curb).', S.ATI6),
  ] },
  { age: 'Adolescent 12–20 y', why: 'Feels indestructible; risk-taking and peer pressure.', items: [
    x('Driver education, seat belts, no driving after drugs/alcohol.', S.T30),
    x('Firearms unloaded and locked, ammunition stored separately.', S.ATIM),
    x('Screen for depression and suicide — ask directly about a plan.', S.L930),
  ] },
];

/* ------------------------------------------------------------------ IMMUNIZATIONS */
export const IMMUNIZATIONS: { age: string; vaccines: string; src: string; note?: string }[] = [
  { age: 'Birth', vaccines: 'Hep B #1', src: S.PPTB },
  { age: '2 months', vaccines: 'DTaP, IPV, Hib, PCV, RV, Hep B #2', src: S.PPTB },
  { age: '4 months', vaccines: 'DTaP, IPV, Hib, PCV, RV', src: S.PPTB },
  { age: '6 months', vaccines: 'DTaP, IPV, Hib, PCV, RV, Hep B #3, influenza', src: S.PPTB },
  { age: '12 months', vaccines: 'MMR, varicella (LIVE — not before 12 mo), Hep A, Hib, PCV', src: S.PPTB, note: 'Lecture 09/30: live vaccines wait until 12 months because the immune system is immature.' },
  { age: '3–6 years', vaccines: 'Yearly influenza', src: S.ATIM },
  { age: '4–6 years', vaccines: 'DTaP, MMR, varicella, IPV', src: S.ATIM },
  { age: '7 years +', vaccines: 'DTaP is used until age 7, then Tdap', src: S.L930 },
  { age: '11–12 years', vaccines: 'Tdap, HPV, meningococcal; yearly flu; COVID per current CDC', src: S.ATI6, note: 'HPV: 2 doses if started before 15; 3 doses if 15+ or immunocompromised; can start at 9 (review #67).' },
];
export const VACCINE_RULES: Sourced[] = [
  x('A mild illness (runny nose, low-grade temperature) is NOT a reason to delay vaccines.', S.REV),
  x('Live vaccines: consider pregnancy, immunosuppression, and recent immune globulin.', S.REV),
  x('After 2 g/kg IVIG for Kawasaki disease, MMR and varicella are delayed about 11 months.', S.REV),
  x('No link between vaccines and autism (studies of over 1.2 million children).', S.T32),
  x('Use the CURRENT CDC schedule (the deck says to check it).', S.REV, 'See "Source vs. Current Guidance" — the schedule changed in 2026 and is in litigation.'),
];

/* ------------------------------------------------------------------ ISOLATION PRECAUTIONS */
export const PRECAUTIONS: { type: string; color: string; what: string; examples: string; src: string; flag?: string }[] = [
  { type: 'Airborne', color: 'red', what: 'Private NEGATIVE-pressure room; N95 respirator; patient wears a mask outside the room.', examples: 'Measles, varicella (airborne + contact), tuberculosis', src: S.ATI11, flag: 'TB visitors: lecture says surgical mask; ATI says N95 (D33).' },
  { type: 'Droplet', color: 'orange', what: 'Mask within about 3 feet; private room or cohort with the same organism; mask the patient for transport.', examples: 'Pertussis, mumps, meningococcal meningitis (until 24 h of antibiotics), strep pharyngitis, scarlet fever, Hib', src: S.ATI11, flag: 'Rubella: ATI droplet vs textbook airborne (D24).' },
  { type: 'Contact', color: 'blue', what: 'Gown and gloves; private room or cohort; dedicated equipment.', examples: 'RSV, impetigo, scabies, lice, MRSA/draining wounds, C. difficile (soap & water)', src: S.ATI11 },
  { type: 'Standard', color: 'teal', what: 'For everyone: hand hygiene, gloves for body fluids, eye protection for splashes.', examples: 'HIV (no isolation needed for HIV itself)', src: S.REV },
  { type: 'Protective environment', color: 'green', what: 'Private room, POSITIVE pressure, HEPA; protects an immunosuppressed child.', examples: 'Stem-cell transplant; severe neutropenia (private room, neutropenic precautions)', src: S.ATI11 },
];

/* ------------------------------------------------------------------ COMPARISON CARDS */
export interface Compare { id: string; title: string; a: string; b: string; rows: [string, string, string][]; key: string; src: string[] }
export const COMPARE: Compare[] = [
  { id: 'croup', title: 'Croup (LTB) vs Epiglottitis', a: 'Croup (LTB)', b: 'Epiglottitis', rows: [
    ['Cause / onset', 'Viral; gradual after a cold; 3 mo–3 y', 'Bacterial (Hib); sudden; older child'],
    ['Signature', 'Barking cough, hoarseness, inspiratory stridor', 'Drooling, tripod position, muffled voice, high fever'],
    ['Treatment', 'Cool mist/humidity, steroids, aerosol epinephrine, calm', 'Airway emergency: intubation/tracheostomy ready, IV antibiotics'],
    ['Never', 'Sedatives (they mask restlessness = hypoxia)', 'Inspect the throat or use a tongue blade'],
  ], key: 'Drooling + tripod = do NOT look in the mouth.', src: [S.T32, S.PPTP, S.L107] },
  { id: 'nephro', title: 'Nephrotic syndrome vs Post-strep glomerulonephritis', a: 'Nephrotic', b: 'APSGN', rows: [
    ['Urine', 'Massive protein, dark frothy', 'Hematuria — tea/cola colored'],
    ['Edema / BP', 'Periorbital on waking → ascites/anasarca; weight gain', 'Edema with HYPERTENSION and oliguria'],
    ['Trigger', 'Usually idiopathic (minimal change)', '10–21 days after strep throat or skin infection; ASO titer ↑'],
    ['Care', 'Prednisone, daily weight, girth, skin care, infection avoidance', 'Bed rest, restrict fluid/sodium/potassium, BP monitoring'],
  ], key: 'Nephrotic = protein out (frothy, puffy). APSGN = blood out (cola) + high BP.', src: [S.T32] },
  { id: 'cyan', title: 'Acyanotic (VSD) vs Cyanotic (Tetralogy of Fallot)', a: 'VSD', b: 'Tetralogy of Fallot', rows: [
    ['Blood flow', 'Left → right shunt; increased pulmonary blood flow', 'Right → left; decreased pulmonary blood flow'],
    ['Signs', 'Loud harsh murmur, heart failure if large', 'Cyanosis, tet spells with crying/feeding, squatting, clubbing'],
    ['Key nursing', 'Feeding is exercise — small frequent feeds, rest', 'Tet spell: knee-chest, calm, call, O₂, (morphine, IV fluids per provider)'],
  ], key: 'Hole with a murmur = VSD; "blue spells" = ToF.', src: [S.T32, S.PPTP, S.REV] },
  { id: 'hem', title: 'Hemophilia vs ITP', a: 'Hemophilia A', b: 'ITP', rows: [
    ['Problem', 'Missing factor VIII (X-linked, boys)', 'Low platelets after a viral illness (autoimmune)'],
    ['Labs', 'Prolonged PTT; normal platelets, PT, bleeding time', 'Platelets <20,000; prolonged bleeding time'],
    ['Signs', 'Hemarthrosis (joints); intracranial bleed = top killer', 'Petechiae, bruising over bony prominences, nosebleeds'],
    ['Care', 'Factor replacement, RICE, no aspirin/NSAIDs, swimming OK', 'Protect from injury, no contact sports, acetaminophen not aspirin'],
  ], key: 'Joints bleed = factor problem. Skin dots = platelet problem.', src: [S.T32, S.PPTP] },
  { id: 'gi', title: 'Pyloric stenosis vs Intussusception vs Hirschsprung', a: 'Pyloric stenosis', b: 'Intussusception / Hirschsprung', rows: [
    ['Age', 'First weeks of life (4–6 wk)', 'Intussusception 3 mo–6 y; Hirschsprung newborn (no meconium 24–48 h)'],
    ['Signature', 'Projectile NONbilious vomiting, hungry, olive mass', 'Currant-jelly stool + sausage mass / ribbon-like foul stool, distension'],
    ['Labs / test', 'Hypochloremic metabolic alkalosis; ultrasound', 'Ultrasound, air enema (fixes most) / rectal biopsy (ATI) or barium enema (textbook)'],
    ['Watch for', 'Fix fluids before surgery; small clear feeds after', 'Normal brown stool = reduced / enterocolitis: girth ↑, fever, explosive diarrhea'],
  ], key: 'Olive = pylorus. Sausage + jelly = intussusception. Ribbon = Hirschsprung.', src: [S.T32, S.ATI22, S.L108] },
  { id: 'dm', title: 'Hypoglycemia vs DKA', a: 'Hypoglycemia', b: 'DKA', rows: [
    ['Onset', 'Fast — shaky, sweaty, behavior change', 'Hours–days; polyuria, polydipsia, vomiting'],
    ['Breathing', 'Normal', 'Kussmaul (deep, fruity breath) — do not suppress it'],
    ['First action', 'Alert: 15 g fast carb (not milk), recheck 15 min. Unconscious: glucagon, nothing by mouth', 'Fluids, insulin per protocol, K replaced once voiding; watch for cerebral edema'],
  ], key: 'Cold & clammy → need candy. Hot & dry → sugar high.', src: [S.REV, S.T32] },
  { id: 'resp', title: 'Asthma vs Bronchiolitis (RSV)', a: 'Asthma', b: 'Bronchiolitis', rows: [
    ['Who', 'Older child; allergic tendency', 'Under 2 y, peak ~6 mo; RSV most common'],
    ['Treatment', 'Rescue albuterol first; inhaled steroid = controller', 'SUPPORTIVE: suction, O₂, fluids; no routine antibiotics/steroids/bronchodilators'],
    ['Precautions', 'Standard', 'Contact + strict hand hygiene'],
  ], key: 'Asthma = open the airway (albuterol). RSV = support the infant.', src: [S.REV, S.T32] },
  { id: 'skin', title: 'Impetigo vs Eczema vs Tinea', a: 'Impetigo', b: 'Eczema / Tinea', rows: [
    ['Look', 'Honey-colored crusts around nose/mouth', 'Eczema: dry itchy flexural patches · Tinea: scaling, cracking (between toes)'],
    ['Contagious?', 'Yes — contact precautions', 'Eczema NO · Tinea yes (fungal, keep dry)'],
    ['Care', 'Topical antibiotic, short nails, separate towels', 'Eczema: tepid bath, moisturize while damp · Tinea: antifungal, dry well'],
  ], key: 'Honey = bacteria; dry & itchy = eczema; damp & peeling = fungus.', src: [S.T32, S.REV] },
  { id: 'prec', title: 'Contact vs Droplet vs Airborne', a: 'Contact / Droplet', b: 'Airborne', rows: [
    ['Spread', 'Touch / large droplets within 3 ft', 'Tiny particles that stay in the air'],
    ['PPE', 'Gown + gloves / mask', 'N95 + negative-pressure room'],
    ['Examples', 'RSV, impetigo, lice, MRSA / pertussis, mumps, meningococcus', 'Measles, varicella, TB'],
  ], key: 'Contact = touch, Droplet = drop (3 ft), Airborne = Alone (negative pressure).', src: [S.ATI11] },
];

/* ------------------------------------------------------------------ MEDICATION FLASHCARDS */
export interface MedCard { id: string; name: string; cls: string; use: string; key: string[]; teach: string[]; src: string[]; color?: 'red' | 'orange' }
export const MED_CARDS: MedCard[] = [
  { id: 'albuterol', name: 'Albuterol', cls: 'Short-acting beta₂-agonist (rescue)', use: 'Acute asthma; 30 min before exercise', key: ['Dilates bronchi within minutes; lasts several hours', 'Can raise heart rate (ATI lists albuterol as a tachycardia cause)'], teach: ['RESCUE first in an attack', 'Spacer for young school-age children; nebulizer for infants'], src: [S.T32, S.L107, S.ATI27] },
  { id: 'ics', name: 'Fluticasone / budesonide', cls: 'Inhaled corticosteroid (controller)', use: 'Daily asthma prevention', key: ['Prevents airway inflammation', 'Not for an acute attack — works too slowly'], teach: ['Take every day even when well', '"-sone" = long-term, not rescue'], src: [S.T32, S.L107] },
  { id: 'montelukast', name: 'Montelukast', cls: 'Leukotriene modifier', use: 'Long-term asthma control', key: ['Reduces inflammation, keeps airways relaxed'], teach: ['Not for acute attacks'], src: [S.T32] },
  { id: 'pred', name: 'Prednisone / corticosteroids', cls: 'Systemic corticosteroid', use: 'Severe asthma flares, nephrotic syndrome, ALL induction, JIA flares', key: ['Not for long-term asthma use (systemic effects)', 'Nephrotic: response 7–21 days, then taper'], teach: ['Avoid infection exposure while on steroids', 'Never stop abruptly — follow the taper'], src: [S.T32] },
  { id: 'digoxin', name: 'Digoxin', cls: 'Cardiac glycoside', use: 'Heart failure', key: ['Count APICAL pulse a full minute before each dose', 'Hold per the child’s prescribed parameters', 'Low potassium → toxicity'], teach: ['Never double or repeat a dose after vomiting', 'Use the exact syringe/dropper'], src: [S.REV, S.ATI27], color: 'red' },
  { id: 'lisinopril', name: 'Lisinopril (ACE inhibitor)', cls: 'ACE inhibitor ("-pril")', use: 'Hypertension, heart failure, kidney protection', key: ['K RETENTION → hyperkalemia', 'First-dose orthostatic hypotension', 'Dry cough (bradykinin)', 'Angioedema = emergency'], teach: ['No potassium salt substitutes or K supplements unless prescribed', 'Rise slowly', 'Contraindicated in pregnancy', 'NSAIDs reduce its effect'], src: [S.ATI19], color: 'red' },
  { id: 'propranolol', name: 'Propranolol', cls: 'Nonselective beta-blocker', use: 'Hyperthyroid symptoms, migraine, hypertension', key: ['Treats SYMPTOMS (heart rate, tremor), not the thyroid', 'Bronchospasm — avoid with asthma', 'Masks hypoglycemia'], teach: ['Don’t stop abruptly (taper)', 'Report a slow pulse'], src: [S.REV, S.ATI19], color: 'orange' },
  { id: 'clonidine', name: 'Clonidine / guanfacine', cls: 'Central alpha-2 agonist', use: 'Hypertension; ADHD', key: ['Drowsiness, dry mouth', 'REBOUND hypertension if stopped suddenly'], teach: ['Taper over 2–4 days', 'Patch: every 7 days on hairless skin'], src: [S.ATI19] },
  { id: 'stimulant', name: 'Methylphenidate (stimulant)', cls: 'CNS stimulant for ADHD', use: 'ADHD (behavior therapy is first line, especially for young children)', key: ['Appetite loss, sleep problems', 'Monitor growth, HR, BP'], teach: ['Give in the morning', 'Side-effect check every 6 months; need reassessed yearly'], src: [S.REV, S.T32] },
  { id: 'ssri', name: 'SSRIs (fluoxetine, sertraline)', cls: 'Antidepressant', use: 'Depression', key: ['FDA black-box warning: suicidal thinking in youth', 'Watch closely in weeks 1–2'], teach: ['Parents watch for suicidal signs early in therapy'], src: [S.T32], color: 'red' },
  { id: 'iron', name: 'Oral iron (ferrous sulfate)', cls: 'Iron supplement', use: 'Iron-deficiency anemia', key: ['Dark/tarry or green stools; constipation', 'Stains teeth', 'OVERDOSE is dangerous'], teach: ['Between meals with vitamin C juice — NOT with milk', 'Syringe toward back of mouth or straw; brush/rinse after', 'Lock it away'], src: [S.T32, S.PPTP, S.L107, S.REV], color: 'red' },
  { id: 'insulin', name: 'Insulin', cls: 'Hormone replacement (type 1 diabetes)', use: 'Type 1 diabetes, DKA', key: ['Insulin drives K into cells — watch K in DKA', 'Store between 36 °F and 86 °F'], teach: ['Sick day: NEVER stop insulin', 'Extra snack before activity', 'Rotate sites'], src: [S.REV, S.T32] },
  { id: 'glucagon', name: 'Glucagon', cls: 'Antihypoglycemic', use: 'Severe hypoglycemia when the child cannot swallow', key: ['Nothing by mouth when unconscious'], teach: ['Turn on side (vomiting risk)', 'Family learns to give it'], src: [S.REV] },
  { id: 'kcl', name: 'Potassium chloride (IV)', cls: 'Electrolyte', use: 'Hypokalemia; added to IV fluids after voiding', key: ['NEVER IV push', 'Add only after urine output is confirmed'], teach: ['Cardiac monitoring with replacement'], src: [S.REV, S.T32], color: 'red' },
  { id: 'aspirin', name: 'Aspirin', cls: 'Salicylate', use: 'Kawasaki disease ONLY (specialist-directed)', key: ['Reye syndrome risk with flu or chickenpox', 'Hidden in bismuth subsalicylate and some cold products'], teach: ['Use acetaminophen for fever otherwise', 'Report flu/varicella exposure during Kawasaki aspirin therapy'], src: [S.REV, S.ATI27], color: 'red' },
  { id: 'ivig', name: 'IVIG', cls: 'Immune globulin', use: 'Kawasaki disease (with aspirin)', key: ['Lowers coronary aneurysm risk'], teach: ['MMR and varicella delayed about 11 months afterward'], src: [S.REV] },
  { id: 'abx', name: 'Penicillin / amoxicillin', cls: 'Antibiotic', use: 'Strep pharyngitis/tonsillitis (10-day course)', key: ['Full course prevents rheumatic fever and glomerulonephritis'], teach: ['Finish all doses even when better', 'New toothbrush after 24 h of antibiotics'], src: [S.T32, S.PPTP] },
  { id: 'enzymes', name: 'Pancreatic enzymes', cls: 'Enzyme replacement (CF)', use: 'Cystic fibrosis malabsorption', key: ['Bulky greasy stools = dose needs adjusting'], teach: ['With EVERY meal and snack (before/with, not after)', 'Do not crush the beads', 'High-calorie, high-protein, ADEK vitamins'], src: [S.L107, S.PPTP, S.REV] },
  { id: 'factor', name: 'Factor VIII', cls: 'Clotting-factor replacement', use: 'Hemophilia A bleeds', key: ['Give early for joint or head bleeds'], teach: ['Home administration teaching', 'Medical alert bracelet'], src: [S.T32] },
  { id: 'nystatin', name: 'Nystatin', cls: 'Antifungal', use: 'Thrush (oral candidiasis)', key: ['White patches that don’t wipe off'], teach: ['Give AFTER feedings onto the lesions; full course', 'Sterilize nipples and pacifiers'], src: [S.T32, S.PPTP] },
  { id: 'isotretinoin', name: 'Isotretinoin', cls: 'Retinoid (severe acne)', use: 'Severe cystic acne', key: ['TERATOGENIC', 'Monitor for depression/suicidal thoughts and lipids'], teach: ['Contraception during and 1 month after', 'Sun protection, dry skin'], src: [S.T32, S.L108], color: 'red' },
  { id: 'meperidine', name: 'Meperidine — AVOID in sickle cell', cls: 'Opioid', use: '(not recommended)', key: ['Normeperidine accumulates → seizures'], teach: ['Question a meperidine order for sickle cell pain'], src: [S.REV], color: 'red' },
  { id: 'palivizumab', name: 'Palivizumab', cls: 'RSV monoclonal antibody', use: 'RSV prevention in high-risk infants (premature, heart disease, chronic lung disease)', key: ['Given monthly for a prescribed period'], teach: ['Hand hygiene still essential'], src: [S.T32] },
  { id: 'indo', name: 'Indomethacin vs Prostaglandin E₁', cls: 'PDA closer vs PDA opener', use: 'Indomethacin closes a PDA; PGE₁ keeps the ductus OPEN in ductal-dependent defects', key: ['Contrast pair: indomethacin closes, prostaglandin opens'], teach: ['PGE₁ can be lifesaving in transposition'], src: [S.PPTP, S.T32] },
];

/* ------------------------------------------------------------------ SOURCE vs CURRENT GUIDANCE (separate, never scored) */
export const CURRENT_GUIDANCE: { topic: string; source: string; current: string; asOf: string }[] = [
  { topic: 'Childhood immunization schedule', source: 'Course PowerPoint and ATI list the traditional schedule (Hep B at birth, rotavirus, flu, etc.).',
    current: 'Looked up before the source lock: a January 2026 federal change narrowed the universal schedule; a March 2026 court order stayed it, so the earlier schedule was restored; an appeal was argued in October 2026 with a decision pending. The AAP 2026 schedule keeps the traditional vaccines.', asOf: 'October 2026 — verify before clinicals' },
  { topic: 'Pediatric heart-rate and hypotension cut-offs', source: 'Your sources give ranges/averages only (see the Vitals tab).',
    current: 'PALS-style references list wider awake/asleep heart-rate ranges and age-based hypotension cut-offs (for example, systolic below 70 + 2 × age for ages 1–10).', asOf: 'Looked up 10/30/2026 before the source lock' },
  { topic: 'Car seats', source: 'Instructor deck: rear-facing at least to 2, booster until 4’9″ (8–12 y).',
    current: 'AAP guidance favors rear-facing as long as possible to the seat’s limits (not a fixed age).', asOf: 'Looked up 10/30/2026 before the source lock' },
];
