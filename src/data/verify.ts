/**
 * Source-verification status of every item (source-lock directive, 10/30/2026).
 *  S = SOURCE-VERIFIED — the keyed answer is stated in an uploaded source (instructor review deck,
 *      lectures, course PowerPoints, textbook chapters 30–32, ATI reading/notes)
 *  D = SOURCE-DERIVED APPLICATION — the item applies a source-stated principle to a new scenario
 *      (numbers needed to answer are given in the item)
 *  U = NOT VERIFIED IN UPLOADED SOURCES — practice only; never counted in scores or readiness
 * Items not listed in D or U are S. Audit notes: sources/notes/*.md, discrepancies.md.
 */
export type VerifyLevel = 'S' | 'D' | 'U';

const D = `A11 A12 A31 A36 A39 A41 A42 B09 B13 B16 B19 B20 B25 B37 B40 B41 C107 C110 C111 C113 C115 C122 C125 C126
C128 C129 C136 C201 C206 C211 C212 C213 C214 C217 C222 C228 C230 C231 C237 C302 C306 C311 C312 C318 C321 C325 C326 C329
C332 C322 C323 P403 P412 NA1 NB1 N201 N203 N205 N212 CA1-2 CA1-3 CA1-6 CA2-4 CA2-6 CB1-2 CB1-3 CB1-6 CB2-5 CB2-6 CC1-2 CC1-4
CC1-5 CC1-6 CC2-1 CC2-3 CC2-4 CC2-6 CC3-2 CC3-3 CC3-4 CC3-5 CC3-6 CC4-5 CC6-1 CC6-3 CC6-4 CC6-5 CC6-6 CC7-2 CC7-5 CC7-6
CC8-1 CC8-3 CC8-6 CC9-1 CC9-2 CC9-3 CC9-4 CC9-5 CC9-6 CC10-2 CC10-3 CC11-2 CC11-5 CC12-1 CC12-2 CC12-5 CC12-6 S04 S07 S10 S15 GD2 V02 V05 V10 V12 V14`.split(/\s+/);

/** reason each held-out item could not be verified */
export const UNVERIFIED: Record<string, string> = {
  GD1: 'Your provided question has no answer key and option B ("understand time") is ambiguous in the ATI milestone reference — practice only.',
  C102: 'Green–yellow–red action-plan zones are not described in the uploaded sources.',
  C104: 'Antibiotic prophylaxis for household contacts of pertussis is not in the uploaded sources.',
  C105: 'The infant apnea-stimulation sequence is not in the uploaded sources.',
  C109: 'Apnea as an adverse effect of prostaglandin E1 is not in the uploaded sources.',
  C114: 'Antibiotics before dental procedures for valve patients are not in the uploaded sources.',
  C116: 'The timing of newborn-screen collection is not in the uploaded sources.',
  C117: 'The method for crushing/mixing levothyroxine is not in the uploaded sources.',
  C121: 'Methimazole fever/sore-throat warning is not in the uploaded sources.',
  C123: 'Malt/barley label reading is not in the uploaded sources.',
  C127: 'Polyhydramnios as a TEF clue is not in the uploaded sources.',
  C218: 'Handling a wet plaster cast with the palms is not in the uploaded sources.',
  C219: 'External-fixator pin-site infection signs are not in the uploaded sources.',
  C220: 'A 15–20-minute cold-pack time is not in the uploaded sources.',
  C221: 'The ankle x-ray decision rule is not in the uploaded sources.',
  C234: 'Taking naproxen with food is not in the uploaded sources (Ch32 lists NSAIDs without teaching).',
  C307: 'Generalized lymphadenopathy is not listed among pediatric HIV findings in the uploaded sources.',
  C308: 'Benzoyl peroxide bleaching fabric is not in the uploaded sources.',
  C317: 'Impetigo school-return timing is not in the uploaded sources.',
  C324: 'School policy for live lice is not in the uploaded sources.',
  C331: 'Strabismus referral age is not in the uploaded sources.',
  'CA1-4': 'Heated high-flow escalation is not in the uploaded sources.',
  'CA1-5': 'The infant apnea-stimulation sequence is not in the uploaded sources.',
  'CB2-4': 'Blood-product double-check steps are not in the uploaded sources.',
  'CC2-2': 'CSF result interpretation is not in the uploaded sources.',
  'CC4-2': 'Obstructive sleep apnea + opioid risk after tonsillectomy is not in the uploaded sources.',
  'CC5-3': 'IVIG infusion reactions are not in the uploaded sources.',
  'CC5-4': 'IVIG infusion-reaction management is not in the uploaded sources.',
  'CC6-2': 'Percent-dehydration classification is not in the uploaded sources.',
  'CC7-3': 'Peritonitis as a nephrotic complication is not in the uploaded sources.',
  'CC7-4': 'Peritonitis management is not in the uploaded sources.',
  'CC8-2': 'The ANC calculation is not in the uploaded sources.',
  'CC8-4': 'The 60-minute antibiotic target for febrile neutropenia is not in the uploaded sources.',
  'CC8-5': 'Epistaxis first aid steps are not in the uploaded sources.',
  'CC10-1': 'Iron-toxicity staging is not in the uploaded sources.',
  'CC10-4': 'Deferoxamine and iron-poisoning orders are not in the uploaded sources.',
  'CC10-5': 'Deferoxamine adverse effects are not in the uploaded sources.',
  'CC10-6': 'Iron-poisoning recovery markers are not in the uploaded sources.',
};

const DSET = new Set(D.filter(Boolean));
export function verifyOf(id: string): VerifyLevel {
  if (UNVERIFIED[id]) return 'U';
  if (DSET.has(id)) return 'D';
  return 'S';
}
export const VERIFY_LABEL: Record<VerifyLevel, string> = {
  S: 'Source-verified',
  D: 'Source-derived application',
  U: 'Not verified in uploaded sources — practice only',
};
/** ids listed in D (for tests) */
export const DERIVED_IDS = [...DSET];
