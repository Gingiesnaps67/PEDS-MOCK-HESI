/**
 * Piaget's Cognitive Development — birth through 17 (11/01/2026).
 * Course sources: Basic Peds PowerPoint (sensorimotor 0–2, object permanence ~9 mo), instructor HESI review #25/#26,
 * ATI milestone reference (toddler object permanence/symbols; preschool preoperational — animism, artificialism,
 * imminent justice; adolescent abstract thought), ATI Ch6 (concrete operations: conservation mass→weight→volume,
 * classification, others' perspective), textbook Ch31 (magical/egocentric thinking, communication, Box 31.3),
 * lecture 09/30 (sensory play). Standard Piaget ages and terms the student asked for that are NOT in the uploaded
 * files are labelled REQ.
 */
export const PS = {
  PPTB: 'Course PowerPoint: Basic Peds Nursing Care',
  R25: 'Instructor HESI Review #25 (preschool thought)',
  R26: 'Instructor HESI Review #26 (early school-age thought)',
  ATIM: 'ATI reference: Developmental milestones',
  ATI6: 'ATI reading: School-age (Ch6)',
  T31: 'Textbook Ch31 (communication, concepts of illness)',
  T31H: 'Textbook Ch31 (hospitalization tables)',
  T32: 'Textbook Ch32',
  L930: 'Lecture 09/30',
  REQ: 'Your request — standard Piaget (not in your uploaded files)',
} as const;

export type PStage = 'sensorimotor' | 'preoperational' | 'concrete' | 'formal';
export type Concept = 'objectPermanence' | 'sensory' | 'symbolic' | 'egocentrism' | 'magical' | 'animism' | 'centration' | 'conservation' | 'reversibility' | 'classification' | 'seriation' | 'abstract' | 'hypothetical' | 'communication';
export const CONCEPT_LABEL: Record<Concept, string> = {
  objectPermanence: 'Object permanence', sensory: 'Learning through senses & movement', symbolic: 'Symbolic thought', egocentrism: 'Egocentrism',
  magical: 'Magical thinking', animism: 'Animism', centration: 'Centration', conservation: 'Conservation', reversibility: 'Reversibility',
  classification: 'Classification', seriation: 'Seriation', abstract: 'Abstract reasoning', hypothetical: 'Hypothetical reasoning', communication: 'Communicating at the child’s level',
};

export interface Stage {
  id: PStage; n: number; name: string; ages: string; srcAges: string; from: number; to: number; icon: string; color: string;
  concept: string; mind: string; traits: string[]; everyday: string[]; nursing: string[]; traps: string[]; memory: string; src: string[];
}
/** standard ranges (from the request) with the course-source ranges alongside */
export const STAGES: Stage[] = [
  { id: 'sensorimotor', n: 1, name: 'Sensorimotor', ages: 'Birth–2 years', srcAges: 'Course PowerPoint: 0–2 years (matches)', from: 0, to: 2, icon: '👐', color: 'p1',
    concept: 'Learning through senses and movement',
    mind: 'The baby thinks with hands, mouth, eyes, and ears. If it can be touched, shaken, dropped, or tasted, it can be learned.',
    traits: ['Learns through reflexes and sensory experiences (PowerPoint)', 'Repeats actions to see what happens — cause and effect (your request)', 'Object permanence develops — highlighted at about 9 months in your course; it emerges gradually (PowerPoint)', 'Toddlers begin to remember and to symbolize objects — the bridge to pretend (ATI)', 'Sensory, solitary play (lecture 09/30)'],
    everyday: ['Peekaboo delights her because she is learning you still exist behind your hands', 'Drops the spoon from the high chair again and again to watch it fall', 'Mouths and shakes every new toy'],
    nursing: ['Use familiar caregivers and comforting sensory input — hold, swaddle, pacifier (textbook Ch31)', 'Offer age-matched sensory play: rattles, mirrors, peekaboo (PowerPoint)', 'Long verbal explanations do not work — comfort and consistency do'],
    traps: ['Object permanence is NOT conservation — one is “still exists,” the other is “still the same amount”', 'Do not expect an infant to understand explanations; prepare the PARENT'],
    memory: 'SENSORIMOTOR = SENSE IT + MOVE IT', src: [PS.PPTB, PS.ATIM, PS.L930] },
  { id: 'preoperational', n: 2, name: 'Preoperational', ages: 'About 2–7 years', srcAges: 'Course sources: preschool 3–6 y (ATI) — toddlers start using symbols; ages 6–7 overlap with school-age', from: 2, to: 7, icon: '🧸', color: 'p2',
    concept: 'Symbols, imagination, and egocentrism',
    mind: 'The child thinks in pictures and pretend, sees the world only from their own spot, and believes thoughts and wishes can make things happen.',
    traits: ['Magical thinking — may see illness as PUNISHMENT (review #25; textbook Ch31)', 'Egocentric — difficulty seeing another person’s viewpoint (review #25)', 'Animism (objects are alive), artificialism, imminent justice (ATI)', 'Symbolic thought and pretend play (ATI; PowerPoint)', 'Does not yet conserve; focuses on one feature (centration) (your request)'],
    everyday: ['Says the moon follows her home', 'Feeds and bandages her teddy bear because it “hurts”', 'Thinks the taller glass has more juice'],
    nursing: ['Explain IMMEDIATELY before a procedure, briefly and concretely (review #25)', 'Demonstrate with a doll or play materials; offer limited choices (review #25)', 'Reassure: illness is not caused by being “bad”; never promise “it won’t hurt” (review #25)'],
    traps: ['A 5-year-old is still typically preschool/preoperational (review #26)', 'Egocentric ≠ selfish — it means cannot take another viewpoint', 'Avoid figures of speech (“frog in your throat”) — taken literally (textbook Ch31)'],
    memory: 'PREOPERATIONAL = PRETEND + ME', src: [PS.R25, PS.R26, PS.ATIM, PS.T31] },
  { id: 'concrete', n: 3, name: 'Concrete Operational', ages: 'About 7–11 years', srcAges: 'Course sources: school-age 6–12 y (ATI Ch6) — ages 6–7 and 11–12 overlap', from: 7, to: 11, icon: '🧱', color: 'p3',
    concept: 'Logic about real, tangible things',
    mind: 'The child reasons well about things they can see and handle, follows rules and steps, but struggles with “what if” ideas.',
    traits: ['Moves from perceptual to conceptual thinking (ATI Ch6)', 'Conservation — mass first, then weight, then volume (ATI Ch6)', 'Classifies more complex information; tells time (ATI Ch6)', 'Sees others’ perspective; solves problems (ATI Ch6)', 'Understands sequence, cause/effect, rules — abstract reasoning still limited (review #26)'],
    everyday: ['Knows the clay ball and the flattened clay are the same amount', 'Sorts baseball cards by team and year', 'Follows the rules of a board game and argues about fairness'],
    nursing: ['Use visible, practical examples — models, real equipment (review #26)', 'Allow questions and participation in care (review #26)', 'Give concrete reasons — 5–8-year-olds want them (textbook Ch31)'],
    traps: ['“Logical” does not mean “abstract” — keep teaching concrete', 'Seriation and reversibility are standard Piaget terms not used in your files'],
    memory: 'CONCRETE = I CAN SEE IT, SO I CAN REASON ABOUT IT', src: [PS.ATI6, PS.R26, PS.T31] },
  { id: 'formal', n: 4, name: 'Formal Operational', ages: 'About 11–12 years onward', srcAges: 'Course sources: adolescent 12–20 y (ATI) — standard Piaget starts ~11–12', from: 11, to: 17, icon: '💭', color: 'p4',
    concept: 'Abstract and hypothetical reasoning',
    mind: 'The teen can think about ideas, the future, and “what if” — but may not use mature reasoning every time, especially under stress.',
    traits: ['Abstract, adult-level thinking (ATI)', 'Can evaluate own thinking (ATI)', 'Logical thought and reasoning; questions parents’ values (textbook Ch31)', 'Considers future consequences and multiple possibilities (your request)', 'May deny illness or focus on single symptoms (textbook Ch31 Box 31.3)'],
    everyday: ['Debates “what would happen if…” about the future', 'Plans a schedule around practice and homework', 'Questions family rules and values'],
    nursing: ['Discuss long-term consequences and treatment options (your request)', 'Include the teen in decisions; respect privacy (textbook Ch31)', 'Ask the teen to explain the plan back in their own words'],
    traps: ['Abstract ability ≠ consistent mature judgment — teens may still take risks', 'Do not teach teens with dolls or sticker charts'],
    memory: 'FORMAL = WHAT IF?', src: [PS.ATIM, PS.T31] },
];
export const STAGE_BY = Object.fromEntries(STAGES.map(s => [s.id, s])) as Record<PStage, Stage>;

/* ------------------------------------------------------------------ timeline ages */
export interface AgePoint { key: string; label: string; years: number }
export const AGES: AgePoint[] = [
  { key: 'nb', label: 'Newborn', years: 0 }, { key: '6m', label: '6 months', years: 0.5 }, { key: '9m', label: '9 months', years: 0.75 }, { key: '12m', label: '12 months', years: 1 }, { key: '18m', label: '18 months', years: 1.5 },
  ...Array.from({ length: 16 }, (_, i) => ({ key: `${i + 2}y`, label: `${i + 2} years`, years: i + 2 })),
];
export function stageAt(y: number): PStage { return y < 2 ? 'sensorimotor' : y < 7 ? 'preoperational' : y < 11 ? 'concrete' : 'formal'; }
export function transitionNote(y: number): string | null {
  if (y >= 1.5 && y <= 2) return 'Near the sensorimotor → preoperational transition: toddlers begin to remember and use symbols (ATI). Progress varies.';
  if (y >= 6 && y <= 7) return 'Overlap: your sources call 6-year-olds school-age (ATI 6–12) while standard Piaget places concrete operations at about 7. Judge by what the child actually does.';
  if (y >= 11 && y <= 12) return 'Overlap: standard Piaget starts formal operations about 11–12; your sources start adolescence at 12. Some children still think concretely.';
  if (y === 5) return 'HESI trap: a 5-year-old is still typically preschool/preoperational (review #26).';
  return null;
}
export interface AgeDetail { understands: string[]; hard: string[]; everyday: string; nursing: string; warning: string }
export function ageDetail(y: number): AgeDetail {
  if (y < 0.5) return { understands: ['Reflexes; sees faces up close; comforted by touch and voice'], hard: ['Anything verbal; objects out of sight are “gone”'], everyday: 'Calms when held skin to skin.', nursing: 'Comfort with holding, swaddling, pacifier; teach the parents.', warning: 'Explanations are for the parent, not the newborn.' };
  if (y < 1) return { understands: ['Cause and effect through repetition', y >= 0.75 ? 'Object permanence emerging (about 9 months in your course)' : 'Beginning to look for things that disappear'], hard: ['Understanding why a procedure is needed'], everyday: 'Loves peekaboo; drops toys to watch them fall.', nursing: 'Keep a parent or familiar caregiver close; use a favorite toy for distraction.', warning: 'Object permanence develops gradually — not on one exact day.' };
  if (y < 2) return { understands: ['Object permanence; remembers people and routines', 'Starts to use words and symbols'], hard: ['Time (“later,” “tomorrow”); others’ feelings'], everyday: 'Searches under the blanket for the hidden ball.', nursing: 'Distress when a parent leaves reflects knowing they still exist; keep the parent present and keep routines.', warning: 'Do not rely on verbal preparation alone.' };
  if (y < 7) return { understands: ['Pretend play and symbols', 'Simple, concrete words and demonstrations'], hard: ['Other viewpoints (egocentrism)', 'Conservation', 'Why illness happens — may think it is punishment'], everyday: y < 4 ? 'Talks to her doll and says it is sad.' : 'Believes the taller glass holds more juice.', nursing: 'Explain immediately before the procedure, simply; demonstrate on a doll; reassure illness is not punishment; offer limited choices.', warning: 'Do not assume preschool children understand complex medical explanations (review #25/#26).' };
  if (y < 11) return { understands: ['Conservation, classification, rules, sequence, cause and effect', 'Other people’s perspective'], hard: ['Abstract or hypothetical risks', 'Long-term “what if” consequences'], everyday: 'Sorts her collection by size and color; follows game rules.', nursing: 'Teach with real equipment and models; let the child practice steps and ask questions.', warning: 'Logical ≠ abstract: keep teaching concrete and visible (review #26).' };
  return { understands: ['Abstract ideas, hypotheses, future consequences', 'Evaluating own thinking'], hard: ['Consistent mature judgment under stress or peer pressure'], everyday: 'Weighs how choices today could affect college or sports.', nursing: 'Discuss options and long-term outcomes; include the teen in decisions; privacy; teach-back.', warning: 'Abstract ability does not guarantee safe choices — reinforce and check understanding.' };
}

/* ------------------------------------------------------------------ question model */
export type Fmt = 'mc' | 'sata' | 'case' | 'identify' | 'priority' | 'correction';
export interface PQ { id: string; stage: PStage | 'mixed'; concept: Concept; fmt: Fmt; prompt: string; options: [string, string][]; answer: number[]; rationale: string; clue: string; memory: string; src: string[] }
const q = (id: string, stage: PQ['stage'], concept: Concept, fmt: Fmt, prompt: string, options: [string, string][], answer: number | number[], rationale: string, clue: string, memory: string, src: string[]): PQ =>
  ({ id, stage, concept, fmt, prompt, options, answer: Array.isArray(answer) ? answer : [answer], rationale, clue, memory, src });
const M = { s: STAGES[0].memory, p: STAGES[1].memory, c: STAGES[2].memory, f: STAGES[3].memory };

export const BANK: PQ[] = [
  /* ---------- Sensorimotor (8) ---------- */
  q('s1', 'sensorimotor', 'objectPermanence', 'case', 'A 10-month-old watches the nurse hide a rattle under a blanket, then pulls the blanket away to find it. Which concept is she demonstrating?', [
    ['Object permanence', ''], ['Conservation', 'Conservation is understanding that amount stays the same when shape changes — a school-age skill.'], ['Animism', 'Animism is believing objects are alive — preoperational.'], ['Egocentrism', 'Egocentrism is difficulty taking another viewpoint.']], 0,
    'She knows the rattle still exists when hidden — object permanence, a sensorimotor milestone highlighted at about 9 months in your course.', 'Searching for a HIDDEN object.', M.s, [PS.PPTB]),
  q('s2', 'sensorimotor', 'sensory', 'priority', 'Which toy is most appropriate for a hospitalized 6-month-old?', [
    ['A brightly colored rattle and an unbreakable mirror', ''], ['A 24-piece puzzle', 'Too complex; small pieces are a choking hazard.'], ['A board game with simple rules', 'Rule-based play is school-age.'], ['A dress-up costume', 'Pretend play is preschool.']], 0,
    'Infants learn through the senses; the PowerPoint lists rattles, mirrors, peekaboo, and tummy time.', 'Infant = senses.', M.s, [PS.PPTB, PS.L930]),
  q('s3', 'sensorimotor', 'communication', 'priority', 'A 7-month-old needs a heel stick. Which preparation is most developmentally appropriate?', [
    ['Have the parent hold and comfort the infant, then offer sucrose on a pacifier as prescribed', ''], ['Give the infant a detailed verbal explanation', 'Infants cannot process verbal explanations.'], ['Show the infant pictures of the equipment the day before', 'Pictures and advance notice need symbolic thought and memory of the future.'], ['Explain to the infant that it will not hurt', 'Never promise no pain; and infants do not understand words.']], 0,
    'Infants are comforted through the senses and familiar caregivers. Sensory comfort, not explanation, is the intervention.', 'Infant + procedure = comfort the senses; prepare the parent.', M.s, [PS.T31, PS.PPTB]),
  q('s4', 'sensorimotor', 'objectPermanence', 'case', 'A 14-month-old screams when her mother leaves the exam room and keeps looking at the door. What best explains her behavior?', [
    ['She knows her mother still exists out of sight and wants her back', ''], ['She is egocentric', 'Egocentrism is about viewpoints, not separation.'], ['She lacks object permanence', 'Searching the door shows object permanence IS present.'], ['She is in the concrete operational stage', '14 months is sensorimotor.']], 0,
    'Looking for the absent parent shows object permanence; separation anxiety follows from knowing she still exists. Keep the parent present when possible.', 'Looking for what is gone.', M.s, [PS.PPTB, PS.ATIM, PS.T31H]),
  q('s5', 'sensorimotor', 'sensory', 'sata', 'Which behaviors are expected in the sensorimotor stage? Select all that apply.', [
    ['Mouthing and shaking new objects', 'Learning through the senses.'], ['Repeatedly dropping a toy to watch it fall', 'Cause-and-effect repetition (standard Piaget).'], ['Searching for a toy hidden under a cloth at about 9 months', 'Object permanence (PowerPoint ~9 mo).'], ['Explaining why the taller glass holds the same amount', 'Conservation — concrete operational.'], ['Pretending a block is a phone', 'Symbolic pretend play — preoperational (begins in toddlers).']], [0, 1, 2],
    'Sensorimotor learning = senses, movement, repetition, and emerging object permanence.', 'Does the behavior need symbols or logic? If yes, it is later.', M.s, [PS.PPTB, PS.REQ]),
  q('s6', 'sensorimotor', 'objectPermanence', 'correction', 'The nurse is teaching parents about infant development. Which statement requires correction?', [
    ['“Peekaboo helps her learn that we still exist when she can’t see us.”', 'Correct.'], ['“At 3 months she should search for toys we hide.”', ''], ['“She learns by touching and putting things in her mouth.”', 'Correct — sensory learning.'], ['“Her understanding that hidden things still exist develops gradually.”', 'Correct.']], 1,
    'Object permanence is highlighted at about 9 months in your course; a 3-month-old is not expected to search for hidden toys.', '“Requires correction” = find the false statement.', M.s, [PS.PPTB]),
  q('s7', 'sensorimotor', 'communication', 'priority', 'A 9-month-old is admitted. Which nursing action best supports the infant’s cognitive and emotional needs?', [
    ['Encourage the parent to stay and bring a familiar toy', ''], ['Explain the hospital routine to the infant', 'Verbal explanation is ineffective at 9 months.'], ['Limit parental visits so the infant adjusts', 'Separation increases distress.'], ['Provide a coloring book', 'Requires fine-motor and symbolic skills she does not have.']], 0,
    'Familiar caregivers and familiar sensory objects comfort a sensorimotor infant; textbook Ch31 recommends rooming-in.', 'Infant → familiar people, familiar senses.', M.s, [PS.T31H, PS.PPTB]),
  q('s8', 'sensorimotor', 'symbolic', 'identify', 'A 20-month-old pretends to drink from an empty toy cup. What does this show?', [
    ['The beginning of symbolic thought at the edge of the sensorimotor stage', ''], ['Formal operational thinking', 'No abstract reasoning.'], ['Conservation', 'Unrelated.'], ['Loss of object permanence', 'Unrelated.']], 0,
    'ATI: toddlers “symbolize objects” — the bridge from sensorimotor to preoperational. Stages overlap.', 'Pretend with an object = symbols starting.', M.p, [PS.ATIM]),

  /* ---------- Preoperational (10) ---------- */
  q('p1', 'preoperational', 'magical', 'case', 'A 4-year-old says, “I got sick because I was bad yesterday.” Which type of thinking is this?', [
    ['Magical thinking', ''], ['Conservation', 'About amounts staying the same.'], ['Abstract reasoning', 'Adolescent.'], ['Object permanence', 'Infant.']], 0,
    'Review #25: preschoolers use magical thinking and may see illness as punishment.', '“Because I was bad” = punishment belief = magical thinking.', M.p, [PS.R25, PS.T31]),
  q('p2', 'preoperational', 'magical', 'priority', 'The same 4-year-old says he got sick because he was bad. What should the nurse say?', [
    ['“You didn’t get sick because of anything you did. Germs made you sick.”', ''], ['“Next time be good and you won’t get sick.”', 'Reinforces the false belief.'], ['“You’re too little to understand.”', 'Dismissive — leaves the punishment belief uncorrected.'], ['Explain the immune system in detail', 'Too abstract.']], 0,
    'Review #25: reassure that illness is not caused by being “bad,” using simple concrete words.', 'Correct the guilt simply.', M.p, [PS.R25]),
  q('p3', 'preoperational', 'communication', 'priority', 'A 3-year-old needs a dressing change in 5 minutes. Which approach is best?', [
    ['Show the steps on a doll right before, using a few simple words', ''], ['Explain it in detail the night before', 'Preparation days ahead increases fear; explain immediately before (review #25).'], ['Say nothing to avoid upsetting her', 'Children need honest, simple preparation.'], ['Tell her, “This won’t hurt at all”', 'Review #25 trap: never promise it won’t hurt.']], 0,
    'Review #25: concrete, brief explanations IMMEDIATELY before; demonstrate with a doll.', 'Preschool → doll, brief, just before.', M.p, [PS.R25]),
  q('p4', 'preoperational', 'animism', 'identify', 'A 4-year-old puts a bandage on her teddy bear because “he hurts too.” Which concept is shown?', [
    ['Animism', ''], ['Egocentrism', 'Egocentrism is about seeing only your own viewpoint.'], ['Conservation', 'Unrelated.'], ['Seriation', 'Ordering objects — concrete.']], 0,
    'ATI lists animism (giving life and feelings to objects) in the preconceptual phase of preoperational thought.', 'Object has feelings = animism.', M.p, [PS.ATIM]),
  q('p5', 'preoperational', 'egocentrism', 'case', 'During a phone call, a 3-year-old nods instead of answering, then says, “Grandma saw me nod.” What explains this?', [
    ['Egocentrism — he assumes others see what he sees', ''], ['Magical thinking', 'He is not linking wishes to events.'], ['Animism', 'No object is alive.'], ['Abstract reasoning', 'Adolescent.']], 0,
    'Egocentrism (review #25) = difficulty taking another person’s viewpoint. It does not mean selfish.', 'Assumes others share his view = egocentric.', M.p, [PS.R25]),
  q('p6', 'preoperational', 'conservation', 'case', 'A 5-year-old watches juice poured from a short wide cup into a tall thin cup and says the tall cup has more. Best interpretation?', [
    ['Expected preoperational thinking — conservation is not yet present', ''], ['A sign of cognitive delay', 'Expected at 5 (review #26: still preschool).'], ['Object permanence', 'Unrelated.'], ['Formal operational thinking', 'No.']], 0,
    'Conservation develops in concrete operations (ATI Ch6). A 5-year-old focuses on height — centration (standard Piaget).', 'Taller = more → not conserving yet.', M.p, [PS.ATI6, PS.R26, PS.REQ]),
  q('p7', 'preoperational', 'communication', 'correction', 'A nurse is preparing a 4-year-old for an IV. Which statement by the student nurse requires correction?', [
    ['“I’ll let her choose which arm, if either is safe.”', 'Correct: limited choices (review #25).'], ['“I’ll tell her I’m going to take a little blood, not that I’ll ‘take’ part of her.”', 'Correct: avoid frightening literal words (textbook Ch31).'], ['“I’ll explain it in detail tomorrow so she has time to prepare.”', ''], ['“I’ll show her on a doll first.”', 'Correct.']], 2,
    'Preschoolers need preparation immediately before (review #25); days ahead increases fear.', 'Timing trap.', M.p, [PS.R25, PS.T31]),
  q('p8', 'preoperational', 'symbolic', 'sata', 'Which are characteristics of preoperational thinking? Select all that apply.', [
    ['Magical thinking', 'Review #25.'], ['Egocentrism', 'Review #25.'], ['Animism', 'ATI.'], ['Conservation of volume', 'Concrete operational (ATI Ch6).'], ['Abstract hypothetical reasoning', 'Formal operational.']], [0, 1, 2],
    'Preoperational = pretend + me: symbols, magic, egocentrism, animism.', 'Pick the “pretend + me” items.', M.p, [PS.R25, PS.ATIM]),
  q('p9', 'preoperational', 'communication', 'priority', 'A 5-year-old asks why he must stay in the hospital. Which explanation fits his thinking?', [
    ['“The doctor needs to give medicine through this tube until your tummy feels better.”', ''], ['A description of how antibiotics kill bacteria', 'Too abstract.'], ['“You’ll stay 72 hours for observation.”', 'Time units and abstract terms are hard at 5.'], ['“If you don’t stay, something terrible will happen.”', 'Frightening; plays on magical thinking.']], 0,
    'Review #26: a 5-year-old is still preschool — do not expect adult understanding of abstract risks or time; use concrete, visible explanations.', 'Age 5 = concrete, simple, visible.', M.p, [PS.R26]),
  q('p10', 'preoperational', 'magical', 'case', 'A 4-year-old is terrified the nurse’s needle will let all her blood leak out. What should the nurse do?', [
    ['Place a bandage over the site and explain simply that the hole closes', ''], ['Tell her not to be silly', 'Dismissive; her fear is developmentally real.'], ['Skip explaining to avoid upsetting her', 'Concrete reassurance helps.'], ['Explain clotting factors', 'Too abstract.']], 0,
    'Preschoolers fear bodily harm and think literally (ATI; textbook Ch31); a bandage and simple words reassure.', 'Fear of “leaking out” = literal, magical thinking.', M.p, [PS.ATIM, PS.T31]),

  /* ---------- Concrete operational (8) ---------- */
  q('c1', 'concrete', 'conservation', 'identify', 'An 8-year-old says, “You just made the clay flat — it’s still the same amount.” Which stage?', [
    ['Concrete operational', ''], ['Preoperational', 'Preoperational children do not conserve.'], ['Sensorimotor', 'No.'], ['Formal operational', 'Conservation is concrete; no abstract reasoning needed.']], 0,
    'ATI Ch6: school-age children master conservation — mass first, then weight, then volume.', 'Same amount despite shape change = conservation.', M.c, [PS.ATI6]),
  q('c2', 'concrete', 'communication', 'priority', 'A 9-year-old with asthma needs inhaler teaching. Which method is best?', [
    ['Demonstrate with the real inhaler and spacer, then have the child show it back', ''], ['Give a written handout to read alone', 'Less effective than hands-on practice.'], ['Discuss how asthma affects future quality of life', 'Abstract/future focus suits teens.'], ['Teach only the parent', 'School-age children should participate.']], 0,
    'Review #26: visible, practical examples and participation. Textbook Ch32: a spacer helps young school-age children get the full dose.', 'School-age → hands-on, real equipment, return demo.', M.c, [PS.R26, PS.T32]),
  q('c3', 'concrete', 'classification', 'case', 'A 10-year-old in the playroom sorts cards by team, then by year. This demonstrates:', [
    ['Classification', ''], ['Animism', 'Preoperational.'], ['Object permanence', 'Infant.'], ['Magical thinking', 'Preoperational.']], 0,
    'ATI Ch6: classifies more complex information.', 'Sorting by categories = classification.', M.c, [PS.ATI6]),
  q('c4', 'concrete', 'seriation', 'identify', 'A 7-year-old lines up pencils from shortest to longest without help. Which concept (standard Piaget term) is this?', [
    ['Seriation', ''], ['Centration', 'Focusing on one feature — preoperational.'], ['Animism', 'No.'], ['Hypothetical reasoning', 'Formal.']], 0,
    'Seriation = arranging in order along a dimension (standard Piaget term from your request; not used in your files). Fits concrete operations.', 'Ordering by size = seriation.', M.c, [PS.REQ]),
  q('c5', 'concrete', 'reversibility', 'identify', 'A 9-year-old explains that the water poured into the tall glass could be poured back to look the same as before. This reasoning is:', [
    ['Reversibility', ''], ['Egocentrism', 'No.'], ['Magical thinking', 'No.'], ['Object permanence', 'No.']], 0,
    'Reversibility = mentally undoing an action (standard Piaget term from your request); it supports conservation in concrete operations.', '“Pour it back” = reversibility.', M.c, [PS.REQ]),
  q('c6', 'concrete', 'abstract', 'correction', 'A nurse is teaching an 8-year-old about a new diabetes diagnosis. Which plan requires correction?', [
    ['Practice fingersticks on a model, then on herself', 'Correct: concrete practice.'], ['Use a picture chart of the steps', 'Correct.'], ['Rely mainly on a discussion of long-term vascular complications', ''], ['Let her ask questions and help with care', 'Correct (review #26).']], 2,
    'Review #26: abstract reasoning remains limited in early school age; long-term hypothetical complications are abstract.', 'Abstract future talk is the misfit.', M.c, [PS.R26]),
  q('c7', 'concrete', 'communication', 'sata', 'Which strategies fit a 10-year-old’s thinking during pre-op teaching? Select all that apply.', [
    ['Show the actual mask and equipment', 'Concrete, visible (review #26).'], ['Explain the order of events step by step', 'Sequence understood (review #26).'], ['Give concrete reasons for each step', 'Textbook Ch31.'], ['Use a doll and avoid all explanation', 'Underestimates a 10-year-old.'], ['Focus on hypothetical rare complications', 'Abstract; frightening.']], [0, 1, 2],
    'Concrete operational children understand sequence, cause/effect, and rules with real objects.', 'Real things + steps + reasons.', M.c, [PS.R26, PS.T31]),
  q('c8', 'concrete', 'egocentrism', 'case', 'A 9-year-old says, “My friend in the next bed is scared because this is his first time here — I should show him the playroom.” This shows:', [
    ['Ability to see another person’s perspective (concrete operational)', ''], ['Egocentrism', 'The opposite.'], ['Animism', 'No.'], ['Magical thinking', 'No.']], 0,
    'ATI Ch6: school-age children are able to see the perspective of others.', 'Takes another’s view = no longer egocentric.', M.c, [PS.ATI6]),

  /* ---------- Formal operational (8) ---------- */
  q('f1', 'formal', 'hypothetical', 'case', 'A 16-year-old asks, “If I keep skipping my insulin, what could happen to my kidneys in 10 years?” Which stage does this question reflect?', [
    ['Formal operational', ''], ['Concrete operational', 'Concrete thinkers struggle with future hypotheticals.'], ['Preoperational', 'No.'], ['Sensorimotor', 'No.']], 0,
    'Abstract, future-oriented “what if” reasoning (ATI: abstract thought in adolescence).', '“What if… in 10 years” = formal.', M.f, [PS.ATIM]),
  q('f2', 'formal', 'abstract', 'priority', 'A 15-year-old with asthma wants to understand long-term effects of not using a controller inhaler. How should the nurse approach teaching?', [
    ['Discuss how daily control affects future lung health and ask the teen to explain the plan back', ''], ['Use a doll to demonstrate the inhaler', 'Preschool strategy.'], ['Teach only the parents', 'Teens should be included (textbook Ch31).'], ['Tell the teen not to worry about the future', 'Misses a teaching opportunity.']], 0,
    'Formal operational teens can weigh future consequences; teach-back checks understanding.', 'Teen + “long-term” = discuss consequences, include, teach-back.', M.f, [PS.ATIM, PS.T31]),
  q('f3', 'formal', 'abstract', 'sata', 'Which nursing actions fit a 16-year-old’s cognitive stage? Select all that apply.', [
    ['Discuss treatment alternatives and their pros and cons', 'Abstract reasoning.'], ['Include the teen in decisions', 'Textbook Ch31.'], ['Ask the teen to describe their understanding', 'Checks reasoning.'], ['Use sticker charts for cooperation', 'Younger children.'], ['Explain only immediately before each procedure with a doll', 'Preschool approach.']], [0, 1, 2],
    'Formal operational: abstract options, future consequences, participation.', 'Treat the teen as a partner in reasoning.', M.f, [PS.T31, PS.ATIM]),
  q('f4', 'formal', 'abstract', 'case', 'A 17-year-old who understands the risks of driving after drinking still plans to do it “just once.” Best interpretation?', [
    ['Abstract ability does not guarantee mature decisions, especially with peer pressure', ''], ['He is in the concrete stage', 'He can reason about risk; judgment is the issue.'], ['He lacks object permanence', 'No.'], ['This proves formal operations are absent', 'Teens may not apply reasoning consistently.']], 0,
    'Adolescents may reason abstractly but feel indestructible (textbook Ch30) — reinforce safety.', 'Knowing ≠ doing.', M.f, [PS.ATIM, 'Textbook Ch30']),
  q('f5', 'formal', 'hypothetical', 'identify', 'A 14-year-old debates what society would be like without laws. This shows:', [
    ['Hypothetical reasoning', ''], ['Classification', 'Concrete.'], ['Animism', 'Preoperational.'], ['Centration', 'Preoperational.']], 0,
    'Thinking about possibilities that do not exist = hypothetical reasoning (standard Piaget; your sources: abstract adolescent thought).', 'Imagined world = hypothetical.', M.f, [PS.ATIM, PS.REQ]),
  q('f6', 'formal', 'communication', 'correction', 'Which statement by a nurse caring for a 15-year-old requires correction?', [
    ['“I’ll explain why taking the medicine every day protects her future health.”', 'Correct.'], ['“I’ll ask her to tell me the plan in her own words.”', 'Correct.'], ['“I’ll explain things only to her parents — teens don’t understand.”', ''], ['“I’ll give her privacy when we discuss sensitive topics.”', 'Correct.']], 2,
    'Teens show logical thought and should be included; textbook Ch31.', 'Excluding the teen is the error.', M.f, [PS.T31]),
  q('f7', 'formal', 'abstract', 'priority', 'A 16-year-old newly diagnosed with type 1 diabetes says, “I’ll just deal with it later.” What is the best nursing response?', [
    ['Explore the teen’s concerns and discuss how today’s choices affect future health', ''], ['Use a puppet show about insulin', 'Too young an approach.'], ['Tell the parents to take over all care', 'Removes autonomy and learning.'], ['Accept the statement and end teaching', 'Denial is common in teens (Box 31.3) — address it.']], 0,
    'Textbook Box 31.3: adolescents may deny illness; formal thinkers can discuss consequences.', 'Denial + teen → explore + future consequences.', M.f, [PS.T31]),
  q('f8', 'formal', 'abstract', 'case', 'A 13-year-old asks detailed questions about what will happen if the first antibiotic does not work. This reflects:', [
    ['Emerging formal operational thinking', ''], ['Preoperational magical thinking', 'No.'], ['Sensorimotor learning', 'No.'], ['Lack of perspective-taking', 'Not related.']], 0,
    'Considering alternative possibilities = formal operations (ATI adolescent abstract thought).', '“What if it doesn’t work?” = possibilities.', M.f, [PS.ATIM]),

  /* ---------- Mixed (6) ---------- */
  q('m1', 'mixed', 'objectPermanence', 'mc', 'Which pairing is correct?', [
    ['Object permanence — sensorimotor; conservation — concrete operational', ''], ['Object permanence — concrete; conservation — sensorimotor', 'Reversed.'], ['Both are preoperational', 'No.'], ['Both are formal operational', 'No.']], 0,
    'Object permanence = it still exists (infant). Conservation = it is still the same amount (school-age).', '“Exists” vs “same amount.”', 'Peekaboo baby vs. pouring-juice kid.', [PS.PPTB, PS.ATI6]),
  q('m2', 'mixed', 'communication', 'correction', 'The nurse must prepare four children for blood draws. Which approach is MISMATCHED to the child’s age?', [
    ['Explaining long-term risks of anemia in detail to a 4-year-old', ''], ['Demonstrating on a doll for a 4-year-old', 'Matched.'], ['Showing the real equipment to a 9-year-old', 'Matched.'], ['Discussing reasons and options with a 16-year-old', 'Matched.']], 0,
    'Abstract, future risks are too complex for a preoperational child (review #25/#26).', 'Find the mismatch.', 'Match the method to the mind.', [PS.R25, PS.R26]),
  q('m3', 'mixed', 'egocentrism', 'mc', 'Which statement correctly separates egocentrism from magical thinking?', [
    ['Egocentrism: can’t see another’s viewpoint. Magical thinking: believes thoughts or actions cause unrelated events.', ''], ['They mean the same thing', 'Different concepts.'], ['Egocentrism means selfish behavior', 'Not cognitive egocentrism.'], ['Magical thinking means pretend play only', 'Pretend play is symbolic thought.']], 0,
    'Both are preoperational but different: viewpoint vs cause.', 'Egocentrism = “my view”; magic = “my fault/my wish.”', 'Ego = Eyes (my view); Magic = Mistaken cause.', [PS.R25]),
  q('m4', 'mixed', 'communication', 'sata', 'Which age–teaching pairs are appropriate? Select all that apply.', [
    ['8 months — parent holds and comforts during care', 'Sensorimotor.'], ['4 years — doll demonstration right before the procedure', 'Preoperational (review #25).'], ['9 years — practice with real equipment', 'Concrete (review #26).'], ['16 years — discussion of options and long-term outcomes', 'Formal.'], ['5 years — detailed discussion of abstract risks', 'Review #26: still preschool.']], [0, 1, 2, 3],
    'Match the method to the stage.', 'Spot the one that over-estimates the child.', 'SENSE → PRETEND → CONCRETE → ABSTRACT', [PS.R25, PS.R26]),
  q('m5', 'mixed', 'conservation', 'case', 'A 6-year-old and an 8-year-old watch clay rolled into a long snake. The 6-year-old says “more clay”; the 8-year-old says “same.” Best interpretation?', [
    ['Expected variation as children move from preoperational into concrete operations', ''], ['The 6-year-old has a delay', 'Six is a transition age; ages overlap.'], ['The 8-year-old is formal operational', 'Conservation is concrete.'], ['Both lack object permanence', 'No.']], 0,
    'Stages are approximate; 6–7 is a transition. Conservation of mass comes first (ATI Ch6).', 'Transition age → variation is normal.', 'Birthdays are not on/off switches.', [PS.ATI6, PS.R26]),
  q('m6', 'mixed', 'abstract', 'mc', 'Which theory does “concrete operations” belong to?', [
    ['Piaget — cognitive development', ''], ['Erikson — psychosocial development', 'Erikson’s school-age stage is industry vs inferiority.'], ['Freud — psychosexual', 'Freud’s school-age stage is latency.'], ['Kohlberg', 'Not in your sources.']], 0,
    'ATI Ch6 lists both for school-age: Piaget concrete operations; Erikson industry vs inferiority.', 'Piaget = thinking; Erikson = social conflict.', 'PIAGET = THINKING; ERIKSON = FEELING/SOCIAL.', [PS.ATI6]),
];

/* ------------------------------------------------------------------ clinical decision simulator (12) */
export interface Scenario { id: string; age: string; stage: PStage; prompt: string; options: [string, string][]; answer: number; why: string; priority?: string; challenge: PQ; src: string[] }
const sc = (id: string, age: string, stage: PStage, prompt: string, options: [string, string][], why: string, challenge: PQ, src: string[], priority?: string): Scenario => ({ id, age, stage, prompt, options, answer: 0, why, challenge, src, priority });
const ch = (id: string, stage: PStage, concept: Concept, prompt: string, options: [string, string][], why: string, src: string[]): PQ => q(id, stage, concept, 'case', prompt, options, 0, why, '', STAGE_BY[stage].memory, src);
export const SCENARIOS: Scenario[] = [
  sc('x1', '18 months', 'sensorimotor', 'A toddler becomes distressed when the parent leaves the exam room. What should the nurse do?', [
    ['Invite the parent to stay and hold the child during the exam', 'Object permanence means she knows the parent still exists — and wants them. Keep the parent present (textbook Ch31 rooming-in).'], ['Explain to the child that the parent will be back in 15 minutes', 'Time concepts are not understood at 18 months.'], ['Distract with a detailed picture book about doctors', 'Too complex.'], ['Keep the parent out so the child adjusts', 'Increases distress.']],
    'Sensorimotor/early toddler: comfort comes from familiar people and senses.', ch('x1c', 'sensorimotor', 'objectPermanence', 'Why does an 18-month-old look for a parent who left the room?', [['She has object permanence', ''], ['She is egocentric', 'Viewpoint, not separation.'], ['She conserves volume', 'No.'], ['She thinks abstractly', 'No.']], 'Knowing the parent still exists out of sight.', [PS.PPTB]), [PS.T31H, PS.PPTB]),
  sc('x2', '3 years', 'preoperational', 'A child believes an injection is punishment for being bad. What should the nurse say?', [
    ['“You didn’t do anything wrong. This medicine helps your body get better.”', 'Corrects magical thinking simply (review #25).'], ['“If you behave, you won’t need more shots.”', 'Confirms the punishment belief.'], ['“It won’t hurt at all.”', 'Never promise no pain (review #25).'], ['“You’re a big kid — don’t cry.”', 'Shaming; ignores the misconception.']],
    'Preoperational magical thinking: illness and treatment seen as punishment.', ch('x2c', 'preoperational', 'magical', 'Which belief is most typical of a 3-year-old?', [['“I got a shot because I was bad.”', ''], ['“The shot has the same amount of medicine either way.”', 'Conservation.'], ['“If I skip my medicine for years, my heart might weaken.”', 'Abstract.'], ['“I can sort the syringes by size.”', 'Seriation.']], 'Punishment belief.', [PS.R25]), [PS.R25], 'Safety first — have help to hold the child safely, then reassure.'),
  sc('x3', '5 years', 'preoperational', 'A child needs preparation for a minor procedure. Which method should the nurse use?', [
    ['A doll and a brief demonstration right before', 'Review #25/#26: concrete, brief, immediately before; a 5-year-old is still preschool.'], ['A detailed written explanation', 'Requires reading and abstract understanding.'], ['An abstract discussion of risks', 'Review #26: do not expect adult understanding of abstract risks.'], ['No explanation', 'Children need honest, simple preparation.']],
    'At 5 the child is still preoperational.', ch('x3c', 'preoperational', 'communication', 'When should the nurse prepare this 5-year-old?', [['Immediately before the procedure', ''], ['One week before', 'Increases fear.'], ['After it is done', 'Too late.'], ['Never — it scares them', 'Honesty matters.']], 'Review #25: explain immediately before.', [PS.R25]), [PS.R25, PS.R26]),
  sc('x4', '9 years', 'concrete', 'A child with asthma needs inhaler education. Which teaching method is most appropriate?', [
    ['Demonstrate with the real inhaler and spacer and have the child return-demonstrate', 'Concrete, hands-on, visible (review #26; textbook Ch32 spacer).'], ['A lecture on airway inflammation', 'Too abstract.'], ['A doll-play session only', 'Underestimates a 9-year-old.'], ['Teach only the parent', 'School-age children should participate.']],
    'Concrete operational learners do best with real objects.', ch('x4c', 'concrete', 'communication', 'Which addition helps this 9-year-old most?', [['A simple step chart she can check off', ''], ['A discussion about lung function at age 40', 'Abstract.'], ['A teddy-bear demonstration', 'Preschool.'], ['Nothing — she will remember', 'Reinforcement helps.']], 'Visible sequence.', [PS.R26]), [PS.R26, PS.T32]),
  sc('x5', '16 years', 'formal', 'An adolescent asks about the long-term consequences of not managing a chronic illness. How should the nurse approach teaching?', [
    ['Discuss future consequences and options openly, include the teen, and use teach-back', 'Formal operations: abstract, future reasoning; include in decisions (textbook Ch31).'], ['Use a puppet', 'Preschool.'], ['Avoid the topic to prevent anxiety', 'Misses a teachable moment.'], ['Speak only with the parents', 'Excludes the teen.']],
    'Formal operational teens can reason about the future — and need privacy and partnership.', ch('x5c', 'formal', 'hypothetical', 'Which question best shows formal thinking?', [['“What could happen if I stop my meds for a year?”', ''], ['“Is my bandage big?”', 'Concrete/literal.'], ['“Did I get sick because I yelled?”', 'Magical.'], ['“Where did the nurse go?”', 'Object permanence.']], 'Hypothetical future.', [PS.ATIM]), [PS.T31, PS.ATIM]),
  sc('x6', '7 months', 'sensorimotor', 'An infant cries during a dressing change. Which action is best?', [
    ['Have the parent hold, talk to, and comfort the infant; use a soothing toy', 'Sensory comfort and familiar caregiver.'], ['Explain the procedure to the infant', 'Ineffective.'], ['Leave the infant alone to calm down', 'Unmet needs increase distress.'], ['Promise a reward afterward', 'Not understood.']],
    'Sensorimotor infants are soothed through the senses.', ch('x6c', 'sensorimotor', 'sensory', 'Which toy suits this infant afterward?', [['A rattle', ''], ['A board game', 'School-age.'], ['A reading book about hospitals', 'Too advanced.'], ['A model kit', 'School-age.']], 'Infant play = senses.', [PS.PPTB]), [PS.T31, PS.PPTB]),
  sc('x7', '4 years', 'preoperational', 'A child is scared that the X-ray machine is a monster that will eat her. What should the nurse do?', [
    ['Let her touch the machine, show it on a stuffed animal, and keep a parent close', 'Concrete, play-based reassurance for magical/animistic fears.'], ['Tell her monsters aren’t real and move on', 'Dismisses a real developmental fear.'], ['Explain how radiation works', 'Too abstract.'], ['Sedate her', 'Not first-line; try developmental approaches.']],
    'Animism and magical thinking: objects can seem alive and dangerous.', ch('x7c', 'preoperational', 'animism', 'Believing the machine is alive is called:', [['Animism', ''], ['Conservation', 'No.'], ['Seriation', 'No.'], ['Abstract reasoning', 'No.']], 'Life given to objects (ATI).', [PS.ATIM]), [PS.ATIM, PS.R25]),
  sc('x8', '10 years', 'concrete', 'A child will have an appendectomy tomorrow. Which preparation is best?', [
    ['Show the real mask and recovery room and explain the steps in order', 'Concrete objects + sequence (review #26; textbook Ch31 surgery preparation).'], ['Explain only with a doll at the last second', 'Underestimates a 10-year-old.'], ['Give a detailed lecture on anesthesia pharmacology', 'Too abstract.'], ['Avoid preparation', 'Increases fear.']],
    'Concrete operational children understand sequence and cause/effect with tangible items.', ch('x8c', 'concrete', 'communication', 'What does a school-age child often fear about anesthesia (textbook Ch31)?', [['Waking up during surgery', ''], ['That the parent no longer exists', 'Infant concern.'], ['Long-term career impact', 'Teen/abstract.'], ['Monsters in the OR', 'Preschool magical fear.']], 'Show mask; “special sleep” (textbook Table 31.8).', [PS.T31H]), [PS.R26, PS.T31H]),
  sc('x9', '6 years', 'preoperational', 'A child at a transition age insists the long line of 5 coins has “more” than the bunched 5 coins. What should the nurse conclude?', [
    ['This is common at 6 — conservation develops gradually during the move to concrete operations', 'Stages overlap at 6–7.'], ['The child has a learning disability', 'Not based on one expected finding.'], ['The child is formal operational', 'No.'], ['The child lacks object permanence', 'No.']],
    'Transition ages vary; judge the pattern, not the birthday.', ch('x9c', 'concrete', 'conservation', 'Which conservation develops FIRST (ATI Ch6)?', [['Mass', ''], ['Volume', 'Last.'], ['Weight', 'Second.'], ['All at once', 'No.']], 'Mass → weight → volume.', [PS.ATI6]), [PS.ATI6]),
  sc('x10', '13 years', 'formal', 'A teen with a new cast asks why he can’t play football for 8 weeks and what could happen if he does. Best response?', [
    ['Explain the healing process and the possible consequences of re-injury, and invite questions', 'Emerging formal thinking can handle reasons and “what if.”'], ['Say “because the doctor said so”', 'Dismisses his reasoning.'], ['Use a doll demonstration', 'Preschool.'], ['Talk only to his parents', 'Excludes him.']],
    'Early adolescents reason about consequences; include them.', ch('x10c', 'formal', 'hypothetical', 'His “what if I play anyway?” question shows:', [['Hypothetical reasoning', ''], ['Animism', 'No.'], ['Centration', 'No.'], ['Object permanence', 'No.']], 'Possibilities = formal.', [PS.ATIM]), [PS.ATIM, PS.T31]),
  sc('x11', '2 years', 'preoperational', 'A toddler must take liquid medicine. Which approach fits her thinking?', [
    ['Offer a simple choice — cup or syringe — and use a brief, concrete phrase', 'Limited real choices; simple words (review #25; textbook Ch31).'], ['Explain why the medicine kills bacteria', 'Too abstract.'], ['Ask, “Do you want your medicine?”', 'Not a real choice — invites “no.”'], ['Hide it in her bottle of milk', 'Never mix meds into essential foods (textbook Ch31).']],
    'Early preoperational: symbols and choices, very concrete words.', ch('x11c', 'preoperational', 'communication', 'How long should sentences be for a 2-year-old (textbook Ch31)?', [['About age + 1 words (≈3 words)', ''], ['10–15 words', 'Too long.'], ['Any length', 'No.'], ['No words — gestures only', 'Simple words work.']], 'Sentence length ≈ age + 1.', [PS.T31]), [PS.R25, PS.T31]),
  sc('x12', '17 years', 'formal', 'A teen with cystic fibrosis wants to skip chest physiotherapy to go out with friends. Best nursing approach?', [
    ['Discuss trade-offs and problem-solve a schedule that fits his goals', 'Formal thinkers weigh options; respects independence.'], ['Tell him he has no choice', 'Power struggle; ignores reasoning ability.'], ['Use a sticker chart', 'Younger children.'], ['Have his parents enforce it without discussion', 'Excludes the teen.']],
    'Abstract reasoning + peer focus → collaborative problem-solving.', ch('x12c', 'formal', 'abstract', 'Why might he still skip therapy even after understanding the risks?', [['Abstract ability doesn’t guarantee consistent mature choices', ''], ['He is preoperational', 'No.'], ['He lacks object permanence', 'No.'], ['He cannot classify', 'No.']], 'Knowing ≠ doing.', [PS.ATIM]), [PS.T31, PS.ATIM]),
];

/* ------------------------------------------------------------------ match the child (20) */
export const MATCH: { id: string; text: string; stage: PStage; why: string }[] = [
  { id: 'k1', text: 'An infant searches for a toy hidden under a blanket.', stage: 'sensorimotor', why: 'Object permanence.' },
  { id: 'k2', text: 'A 4-year-old believes her doll can feel pain.', stage: 'preoperational', why: 'Animism.' },
  { id: 'k3', text: 'An 8-year-old knows the water amount stays the same in a taller glass.', stage: 'concrete', why: 'Conservation.' },
  { id: 'k4', text: 'A teenager considers hypothetical future outcomes of a decision.', stage: 'formal', why: 'Hypothetical reasoning.' },
  { id: 'k5', text: 'A preschooler assumes everyone sees the world exactly as she does.', stage: 'preoperational', why: 'Egocentrism.' },
  { id: 'k6', text: 'A school-age child arranges sticks from shortest to tallest.', stage: 'concrete', why: 'Seriation.' },
  { id: 'k7', text: 'A 5-month-old puts every new toy in her mouth.', stage: 'sensorimotor', why: 'Sensory learning.' },
  { id: 'k8', text: 'A 3-year-old says the sun is following him.', stage: 'preoperational', why: 'Animism / egocentrism.' },
  { id: 'k9', text: 'A 10-year-old sorts rocks by color, then by size.', stage: 'concrete', why: 'Classification.' },
  { id: 'k10', text: 'A 15-year-old argues about what is fair in society.', stage: 'formal', why: 'Abstract reasoning.' },
  { id: 'k11', text: 'A 9-month-old drops a spoon again and again to watch it fall.', stage: 'sensorimotor', why: 'Cause and effect through repetition.' },
  { id: 'k12', text: 'A 4-year-old thinks she got sick because she hit her brother.', stage: 'preoperational', why: 'Magical thinking (illness = punishment).' },
  { id: 'k13', text: 'A 9-year-old explains you could pour the juice back to its first glass.', stage: 'concrete', why: 'Reversibility.' },
  { id: 'k14', text: 'A 16-year-old weighs the pros and cons of two treatment options.', stage: 'formal', why: 'Evaluates multiple possibilities.' },
  { id: 'k15', text: 'A 5-year-old says the tall thin cup has more juice.', stage: 'preoperational', why: 'No conservation yet; centration.' },
  { id: 'k16', text: 'A 2-year-old pretends a block is a phone.', stage: 'preoperational', why: 'Symbolic thought (toddler symbols, ATI).' },
  { id: 'k17', text: 'A 7-year-old follows the rules of a board game and notices cheating.', stage: 'concrete', why: 'Understands rules.' },
  { id: 'k18', text: 'A 14-year-old plans study time around future exams and sports.', stage: 'formal', why: 'Planning ahead.' },
  { id: 'k19', text: 'An 18-month-old looks at the door after her mother leaves.', stage: 'sensorimotor', why: 'Object permanence.' },
  { id: 'k20', text: 'An 11-year-old says her friend is nervous because it is his first surgery.', stage: 'concrete', why: 'Perspective-taking (ATI Ch6) — still concrete at 11 for many children.' },
];

/* ------------------------------------------------------------------ flashcards (12) */
export interface Card { id: Concept; term: string; def: string; stage: PStage; ages: string; everyday: string; nursing: string; memory: string; src: string }
export const CARDS: Card[] = [
  { id: 'objectPermanence', term: 'Object permanence', def: 'Knowing that people and objects still exist when out of sight.', stage: 'sensorimotor', ages: 'Develops gradually; highlighted ~9 months', everyday: 'Peekaboo; searching under the blanket.', nursing: 'Separation distress is expected — keep the parent present.', memory: '“Still there.”', src: PS.PPTB },
  { id: 'egocentrism', term: 'Egocentrism', def: 'Difficulty understanding another person’s viewpoint. Not the same as selfish.', stage: 'preoperational', ages: 'About 2–7 years', everyday: 'Nods on the phone and thinks Grandma saw.', nursing: 'Explain from the child’s point of view; keep it about them.', memory: 'Ego = my Eyes only.', src: PS.R25 },
  { id: 'magical', term: 'Magical thinking', def: 'Believing thoughts, wishes, or actions caused unrelated events.', stage: 'preoperational', ages: 'About 2–7 years', everyday: '“I got sick because I was bad.”', nursing: 'Reassure: illness is not punishment.', memory: 'Magic = Mistaken cause.', src: PS.R25 },
  { id: 'animism', term: 'Animism', def: 'Giving life and feelings to objects.', stage: 'preoperational', ages: 'About 2–7 years', everyday: 'The teddy bear is sad; the moon follows me.', nursing: 'Use the child’s stuffed animal to demonstrate procedures.', memory: 'ANIMism = ANIMals everywhere.', src: PS.ATIM },
  { id: 'symbolic', term: 'Symbolic thought', def: 'Using one thing to stand for another — words, pretend, drawings.', stage: 'preoperational', ages: 'Begins ~2 years', everyday: 'A block becomes a phone.', nursing: 'Pretend medical play with dolls.', memory: 'Symbol = Stand-in.', src: PS.ATIM },
  { id: 'conservation', term: 'Conservation', def: 'An amount stays the same when its shape or container changes.', stage: 'concrete', ages: 'About 7–11 years (school-age in your sources)', everyday: 'Same juice in the tall and short glass.', nursing: 'Explain med volumes with real cups and syringes.', memory: 'Conserve = Same Stuff.', src: PS.ATI6 },
  { id: 'centration', term: 'Centration', def: 'Focusing on only one feature (like height) and ignoring others.', stage: 'preoperational', ages: 'About 2–7 years', everyday: 'Taller glass = more, ignoring width.', nursing: 'Keep explanations to one simple idea at a time.', memory: 'Center on one thing.', src: PS.REQ },
  { id: 'reversibility', term: 'Reversibility', def: 'Mentally undoing an action to return to the start.', stage: 'concrete', ages: 'About 7–11 years', everyday: '“You could pour it back.”', nursing: 'Explain that a cast or IV will come off later.', memory: 'Rewind button.', src: PS.REQ },
  { id: 'classification', term: 'Classification', def: 'Sorting by categories and subcategories.', stage: 'concrete', ages: 'About 7–11 years', everyday: 'Sorting cards by team, then year.', nursing: 'Group teaching steps into clear categories.', memory: 'Class = Categories.', src: PS.ATI6 },
  { id: 'seriation', term: 'Seriation', def: 'Ordering items along a dimension (size, length).', stage: 'concrete', ages: 'About 7–11 years', everyday: 'Pencils shortest → longest.', nursing: 'Step-by-step numbered instructions.', memory: 'Series = in order.', src: PS.REQ },
  { id: 'abstract', term: 'Abstract reasoning', def: 'Thinking about ideas that are not physically present.', stage: 'formal', ages: 'About 11–12+ (adolescent in your sources)', everyday: 'Debating fairness or justice.', nursing: 'Discuss options, values, long-term outcomes.', memory: 'Abstract = in the Air.', src: PS.ATIM },
  { id: 'hypothetical', term: 'Hypothetical reasoning', def: 'Reasoning about “what if” possibilities.', stage: 'formal', ages: 'About 11–12+', everyday: '“What if I skip my insulin?”', nursing: 'Explore consequences; teach-back.', memory: 'FORMAL = WHAT IF?', src: PS.REQ },
];

/* ------------------------------------------------------------------ comparison lessons (6) */
export const COMPARES: { id: string; title: string; a: string; b: string; example: string; q: PQ }[] = [
  { id: 'cmp1', title: 'Sensorimotor vs. Preoperational', a: 'Learns by doing and sensing; needs objects present.', b: 'Uses symbols, pretend, and language; still not logical.', example: 'A 10-month-old bangs the toy phone; a 3-year-old pretends to call Grandma on it.', q: q('cq1', 'mixed', 'symbolic', 'mc', 'Pretending a banana is a phone first shows:', [['Preoperational symbolic thought', ''], ['Sensorimotor object permanence', 'No pretend needed for that.'], ['Concrete classification', 'No.'], ['Formal reasoning', 'No.']], 0, 'Symbols mark the move into preoperational.', 'Pretend = symbols.', M.p, [PS.ATIM]) },
  { id: 'cmp2', title: 'Preoperational vs. Concrete Operational', a: 'Judges by looks; one feature at a time; magic and “me.”', b: 'Logic with real things: conserves, classifies, follows rules.', example: 'Juice poured into a tall glass: the 4-year-old says “more,” the 8-year-old says “same.”', q: q('cq2', 'mixed', 'conservation', 'mc', 'Which child is concrete operational?', [['The one who says “same amount”', ''], ['The one who says “taller has more”', 'Preoperational.'], ['Neither — conservation is formal', 'Concrete.'], ['Both', 'No.']], 0, 'Conservation = concrete (ATI Ch6).', 'Same amount = concrete.', M.c, [PS.ATI6]) },
  { id: 'cmp3', title: 'Concrete vs. Formal Operational', a: 'Reasons about what they can see and touch.', b: 'Reasons about ideas, the future, and “what if.”', example: 'A 9-year-old learns with a glucose meter; a 16-year-old discusses how control affects health in 20 years.', q: q('cq3', 'mixed', 'abstract', 'mc', '“What might happen to my eyes years from now?” is typical of:', [['Formal operational', ''], ['Concrete operational', 'Concrete focuses on the here and now.'], ['Preoperational', 'No.'], ['Sensorimotor', 'No.']], 0, 'Future/hypothetical = formal.', 'Years from now = what if.', M.f, [PS.ATIM]) },
  { id: 'cmp4', title: 'Egocentrism vs. Magical Thinking', a: 'Egocentrism: “Everyone sees what I see.” (viewpoint)', b: 'Magical thinking: “My thoughts or actions made it happen.” (cause)', example: '“You can see my picture” on the phone = egocentrism. “I got sick because I was mean” = magical.', q: q('cq4', 'mixed', 'magical', 'mc', '“Mommy got sick because I wished she would go away” is:', [['Magical thinking', ''], ['Egocentrism', 'That is about viewpoints.'], ['Animism', 'No object is alive.'], ['Conservation', 'No.']], 0, 'Wish caused event = magical.', 'My wish = cause.', 'Magic = Mistaken cause; Ego = my Eyes.', [PS.R25]) },
  { id: 'cmp5', title: 'Conservation vs. Object Permanence', a: 'Object permanence: it STILL EXISTS (infant).', b: 'Conservation: it is STILL THE SAME AMOUNT (school-age).', example: 'Hiding a toy (permanence) vs pouring water (conservation).', q: q('cq5', 'mixed', 'objectPermanence', 'mc', 'Hiding a ball under a cup tests:', [['Object permanence', ''], ['Conservation', 'Conservation tests amount.'], ['Seriation', 'No.'], ['Abstract reasoning', 'No.']], 0, 'Hidden = exists?', 'Exists vs amount.', 'Peekaboo baby vs pouring kid.', [PS.PPTB]) },
  { id: 'cmp6', title: 'Concrete vs. Abstract Reasoning', a: 'Concrete: needs real, visible examples.', b: 'Abstract: works with ideas and hypotheticals.', example: 'Showing a spacer (concrete) vs. explaining airway remodeling over time (abstract).', q: q('cq6', 'mixed', 'communication', 'mc', 'Which teaching suits a 9-year-old best?', [['Practicing with the real spacer', ''], ['Explaining long-term airway remodeling', 'Abstract.'], ['A puppet show only', 'Preschool.'], ['No teaching', 'No.']], 0, 'Concrete learner → real equipment (review #26).', 'Can she see it?', M.c, [PS.R26]) },
];

/* ------------------------------------------------------------------ comparison table rows */
export const TABLE_ROWS: { label: string; v: Record<PStage, string> }[] = [
  { label: 'Ages (standard)', v: { sensorimotor: 'Birth–2', preoperational: '~2–7', concrete: '~7–11', formal: '~11–12+' } },
  { label: 'Ages (your sources)', v: { sensorimotor: '0–2 (PowerPoint)', preoperational: 'Preschool 3–6 (ATI); toddlers begin symbols', concrete: 'School-age 6–12 (ATI Ch6)', formal: 'Adolescent 12–20 (ATI)' } },
  { label: 'How the child learns', v: { sensorimotor: 'Senses, reflexes, movement', preoperational: 'Pretend, symbols, words', concrete: 'Real objects, rules, steps', formal: 'Ideas, possibilities' } },
  { label: 'Key abilities', v: { sensorimotor: 'Object permanence', preoperational: 'Symbolic thought', concrete: 'Conservation, classification', formal: 'Abstract & hypothetical reasoning' } },
  { label: 'May misunderstand', v: { sensorimotor: 'Anything verbal; out of sight = gone (early)', preoperational: 'Other viewpoints; cause; amounts', concrete: '“What if” and long-term risks', formal: 'May not apply reasoning under stress' } },
  { label: 'Common behaviors', v: { sensorimotor: 'Mouthing, dropping, peekaboo', preoperational: 'Talks to toys; illness = punishment', concrete: 'Collections, rules, fairness', formal: 'Questions values; plans ahead' } },
  { label: 'Play', v: { sensorimotor: 'Rattles, mirrors, peekaboo', preoperational: 'Dress-up, pretend, crafts', concrete: 'Board games, models, team sports', formal: 'Clubs, music, peer activities' } },
  { label: 'Best nursing communication', v: { sensorimotor: 'Comfort; teach the parent', preoperational: 'Brief, just before, doll, no false promises', concrete: 'Real equipment, steps, concrete reasons', formal: 'Discuss options & outcomes; privacy; teach-back' } },
  { label: 'Exam clue words', v: { sensorimotor: '“hidden,” “peekaboo,” “mouths”', preoperational: '“because I was bad,” “doll feels,” “taller = more”', concrete: '“same amount,” “sorts,” “rules”', formal: '“what if,” “in the future,” “options”' } },
];

export const CRASH_RAPID: PQ[] = [
  q('r1', 'sensorimotor', 'objectPermanence', 'mc', 'Peekaboo builds…', [['Object permanence', ''], ['Conservation', ''], ['Abstract reasoning', ''], ['Seriation', '']], 0, 'Sensorimotor.', '', M.s, [PS.PPTB]),
  q('r2', 'preoperational', 'magical', 'mc', '“I’m sick because I was bad” =', [['Magical thinking', ''], ['Egocentrism', ''], ['Conservation', ''], ['Classification', '']], 0, 'Preoperational (review #25).', '', M.p, [PS.R25]),
  q('r3', 'concrete', 'conservation', 'mc', '“Same amount, different glass” =', [['Conservation', ''], ['Animism', ''], ['Object permanence', ''], ['Hypothetical reasoning', '']], 0, 'Concrete (ATI Ch6).', '', M.c, [PS.ATI6]),
  q('r4', 'formal', 'hypothetical', 'mc', '“What if I stop my meds?” =', [['Formal operational', ''], ['Concrete operational', ''], ['Preoperational', ''], ['Sensorimotor', '']], 0, 'Formal.', '', M.f, [PS.ATIM]),
  q('r5', 'preoperational', 'communication', 'mc', 'Best prep for a 5-year-old:', [['Doll demo right before', ''], ['Detailed risk talk', ''], ['Written handout', ''], ['No explanation', '']], 0, 'Review #25/#26.', '', M.p, [PS.R25, PS.R26]),
];

/** expands terse distractor notes ("No.") into a real explanation based on the concept or stage the option names */
const KEYS: [RegExp, string][] = [
  [/object permanence|still exists|out of sight/i, 'Object permanence (knowing hidden things still exist) is a sensorimotor milestone — about 9 months in your course.'],
  [/conserv|same amount/i, 'Conservation (amount stays the same when shape changes) develops in the concrete operational stage (ATI Ch6).'],
  [/animism|alive|feel pain|feelings/i, 'Animism (objects are alive or have feelings) is preoperational (ATI).'],
  [/magical|because i was bad|punish|wish/i, 'Magical thinking (thoughts or behavior cause unrelated events) is preoperational (review #25).'],
  [/egocentr|viewpoint|perspective/i, 'Egocentrism (difficulty taking another person’s viewpoint) is preoperational; school-age children can see others’ perspectives (ATI Ch6).'],
  [/seriation|shortest|longest|in order/i, 'Seriation (ordering by size) fits concrete operations.'],
  [/classif|sort/i, 'Classification (sorting by categories) is concrete operational (ATI Ch6).'],
  [/centration/i, 'Centration (focusing on one feature) is preoperational.'],
  [/reversib/i, 'Reversibility (mentally undoing an action) is concrete operational.'],
  [/hypothetical|what if|future|abstract|formal/i, 'Abstract and hypothetical (“what if”) reasoning is formal operational — adolescence.'],
  [/concrete/i, 'Concrete operational children reason logically about real, visible things but struggle with abstract ideas.'],
  [/preoperational|pretend|doll|puppet/i, 'Preoperational (preschool) children think in symbols and pretend; that approach fits a younger child.'],
  [/sensorimotor|rattle|reflex/i, 'Sensorimotor infants learn through senses and movement.'],
  [/sticker/i, 'Sticker charts suit younger children, not teens.'],
];
export function explainWrong(option: string, why: string): string {
  if (why && why.length > 12) return why;
  const hit = KEYS.find(([re]) => re.test(option));
  return hit ? hit[1] : (why || 'This does not match the child’s stage or the situation described.');
}
