/**
 * Erikson's Psychosocial Development Mastery Center — SOURCE-LOCKED content (10/30/2026).
 * Stage names/ages: lecture 09/30, Basic Peds PowerPoint (Erikson activity table), ATI milestone reference, ATI Ch6.
 * Nursing interventions: textbook Ch31 (hospitalization Table 31.7, surgery Table 31.8, communication,
 * concepts of illness Box 31.3, procedures), Ch30, Ch32, and the instructor HESI review.
 */
export const ES = {
  L930: 'Lecture 09/30',
  PPTB: 'Course PowerPoint: Basic Peds Nursing Care (Erikson activity table)',
  ATIM: 'ATI reference: Developmental milestones',
  ATI6: 'ATI reading: School-age (Ch6)',
  T31H: 'Textbook Ch31: Hospitalization (Tables 31.7, 31.8)',
  T31C: 'Textbook Ch31: Communication & procedures',
  T31O: 'Textbook Ch31: Overview (Box 31.3 concepts of illness)',
  T30: 'Textbook Ch30: Health promotion',
  T32: 'Textbook Ch32: Cognitive disorders',
  REV: 'Instructor HESI Review 2026',
} as const;

export type StageId = 'trust' | 'autonomy' | 'initiative' | 'industry' | 'identity';
export interface Stage {
  n: number; id: StageId; stage: string; positive: string; negative: string; group: string; ages: string; srcAges: string;
  icon: string; hook: string; meaning: string; behaviors: string[]; nursing: string[]; ifUnresolved: string; play: string; traps: string[]; src: string[];
}
export const STAGES: Stage[] = [
  { n: 1, id: 'trust', stage: 'Trust vs. Mistrust', positive: 'Trust', negative: 'Mistrust', group: 'Infant', ages: 'Birth–1 year', srcAges: 'Birth–1 y (lecture; PowerPoint 0–12 mo; ATI)',
    icon: '🤝', hook: '“Can I trust you?”',
    meaning: 'The infant learns whether caregivers will reliably meet needs. Trust needs consistent, loving care.',
    behaviors: ['Calms with the parent; cries when handed to a stranger', 'Stranger and separation anxiety begin about 6–8 months', 'Engages senses; solitary play'],
    nursing: ['Rooming-in; teach parents to give care', 'Assign the same nurse when possible (consistency)', 'Comfort: hold, swaddle, rock, pacifier'],
    ifUnresolved: 'Mistrust — and the child cannot move on to autonomy (“you’ve got to get through this stage to progress”).',
    play: 'Rattles, soft toys, teething rings, peek-a-boo, mirrors, tummy time',
    traps: ['Infants do not play WITH other babies — solitary, sensory play', 'Rotating many caregivers is not “getting them used to people”'],
    src: [ES.L930, ES.PPTB, ES.ATIM, ES.T31H] },
  { n: 2, id: 'autonomy', stage: 'Autonomy vs. Shame and Doubt', positive: 'Autonomy', negative: 'Shame and doubt', group: 'Toddler', ages: '1–3 years', srcAges: '1–3 y (lecture; PowerPoint; ATI)',
    icon: '👣', hook: '“Me do it!”',
    meaning: 'The toddler becomes an independent individual: “I don’t need mommy, I’m gonna do everything by myself.”',
    behaviors: ['Feeds and undresses self; begins toilet training', 'Separation anxiety; gender identity by 3', 'Parallel play; tantrums; regression under stress'],
    nursing: ['Offer REAL choices only (“cup or syringe?”)', 'Keep home routines and rituals; praise; set limits', 'Talk to the parent first, then the toddler; expect regression'],
    ifUnresolved: 'Shame and doubt — and autonomy depends on trust first (“they trust you’re gonna be there”).',
    play: 'Push-pull toys, large building blocks, scribbling — PARALLEL play',
    traps: ['“Do you want your medicine?” invites a “no” — not a real choice', 'Regression (bed-wetting, thumb-sucking) in the hospital is expected, not misbehavior'],
    src: [ES.L930, ES.PPTB, ES.ATIM, ES.T31H, ES.T31C] },
  { n: 3, id: 'initiative', stage: 'Initiative vs. Guilt', positive: 'Initiative', negative: 'Guilt', group: 'Preschooler', ages: '3–6 years', srcAges: '3–6 y (PowerPoint; ATI); “preschool” (lecture)',
    icon: '🚀', hook: '“I’ll start it myself!”',
    meaning: 'The child starts activities without being told — picks own clothes, brushes own teeth, decides on her own.',
    behaviors: ['Imaginative, pretend, dress-up, ASSOCIATIVE play', 'Guilt when unable (spills the milk she poured, then: “Are you mad at me?”)', 'Believes illness is punishment for bad thoughts or behavior; fears bodily harm'],
    nursing: ['Explain briefly right BEFORE the procedure; show it on a doll', 'Don’t promise “it won’t hurt”', 'Correct guilt: “Nothing you did made you sick”'],
    ifUnresolved: 'Guilt — waits to be told what to do before every action and cannot move on to industry.',
    play: 'Dress-up, pretend play, tricycles, simple arts and crafts — associative play',
    traps: ['A 5-year-old is still preschool (initiative), not school-age', 'Preparing a preschooler days in advance increases fear'],
    src: [ES.L930, ES.PPTB, ES.ATIM, ES.T31O, ES.REV] },
  { n: 4, id: 'industry', stage: 'Industry vs. Inferiority', positive: 'Industry', negative: 'Inferiority', group: 'School-age', ages: '6–12 years', srcAges: '6–12 y (lecture; PowerPoint; ATI Ch6)',
    icon: '🛠️', hook: '“I can make it!”',
    meaning: 'Industry = creativeness and skill: building skills and knowledge that make meaningful contributions; accomplishment through cooperating and competing.',
    behaviors: ['Draws pictures and expects them on the fridge; collections, hobbies, models', 'Team sports; rule-based games; same-sex peer groups; fears ridicule', 'Wants concrete reasons; fears separation from friends and school'],
    nursing: ['Keep up schoolwork; friends visit or call', 'Include the child in decisions', 'Challenge with tasks the child can accomplish'],
    ifUnresolved: 'Inferiority — the child on the sidelines who cannot bond with the team.',
    play: 'Board games, collections, team sports, puzzles, model kits',
    traps: ['ATI: reward systems that only reward successful mastery can CREATE inferiority in children who cannot finish', 'Push-pull toys and pretend play are for younger children'],
    src: [ES.L930, ES.PPTB, ES.ATI6, ES.T31H] },
  { n: 5, id: 'identity', stage: 'Identity vs. Role Confusion', positive: 'Identity', negative: 'Role confusion', group: 'Adolescent', ages: '12–18 years', srcAges: '12–18 y (lecture; PowerPoint); ATI reference band 12–20 y',
    icon: '🪞', hook: '“Who am I?”',
    meaning: 'The teen searches for identity: peer group, vocation, sexuality — cliques, music, and fashion sense.',
    behaviors: ['Peer approval is key; may reject parents', 'Body image central; fears loss of control and peers’ reactions to scars', 'May deny illness; wants privacy'],
    nursing: ['Include the teen in decisions; privacy; confidentiality with safety limits', 'Allow peer visits; may want parents present less', 'Before surgery: reassure only the planned procedure; introduce a peer who had it'],
    ifUnresolved: 'Role confusion — the lecture links this to later intimacy problems and to the suicide peak at 12–18.',
    play: 'Peer groups, sports, clubs, music, art, journaling, career programs',
    traps: ['Teens are not taught with dolls or sticker charts', 'Confidentiality is NOT absolute — safety risks must be shared'],
    src: [ES.L930, ES.PPTB, ES.ATIM, ES.T31H, ES.REV] },
];
export const STAGE_BY_ID = Object.fromEntries(STAGES.map(s => [s.id, s])) as Record<StageId, Stage>;
export const STAGE_NAMES = STAGES.map(s => s.stage);

/* ------------------------------------------------------------------ question model */
export interface EQ {
  id: string; game: 3 | 4 | 5 | 6 | 7; level: 1 | 2 | 3; stage: StageId | 'mixed';
  prompt: string;
  /** [option text, why it is right/wrong] — answer index refers to this array */
  options: [string, string][]; answer: number;
  clue: string; src: string[];
}
const stageOpts = (why: Partial<Record<StageId, string>>): [string, string][] =>
  STAGES.map(s => [s.stage, why[s.id] ?? `${s.stage} is ${s.group.toLowerCase()} (${s.ages}).`]);
const stQ = (id: string, game: 3 | 4, level: 1 | 2 | 3, stage: StageId, prompt: string, why: Partial<Record<StageId, string>>, clue: string, src: string[]): EQ =>
  ({ id, game, level, stage, prompt, options: stageOpts(why), answer: STAGES.findIndex(s => s.id === stage), clue, src });

/* GAME 3 — match the psychosocial conflict (progressively harder) */
export const G3: EQ[] = [
  stQ('g3-1', 3, 1, 'trust', 'Need: consistent and loving care.', { trust: 'PowerPoint: Erikson trust vs. mistrust — “needs consistent and loving care to develop trust.”' }, 'Consistency = trust.', [ES.PPTB]),
  stQ('g3-2', 3, 1, 'autonomy', 'Need: to do things by myself — “I don’t need mommy.”', { autonomy: 'Lecture: autonomy = “I am an independent individual.”', initiative: 'Initiative is starting activities without being told; independence itself is autonomy.' }, '“By myself” = autonomy.', [ES.L930]),
  stQ('g3-3', 3, 1, 'initiative', 'Need: to start activities without waiting to be told.', { initiative: 'Lecture: initiative — “you don’t have to tell them to do it.”', autonomy: 'Autonomy is doing it alone once shown; initiative is starting it unprompted.' }, '“Starts on their own” = initiative.', [ES.L930]),
  stQ('g3-4', 3, 1, 'industry', 'Need: to build skills and knowledge that make a meaningful contribution.', { industry: 'ATI Ch6: industry is achieved through skills and knowledge that allow meaningful contributions.' }, 'Skills + accomplishment = industry.', [ES.ATI6]),
  stQ('g3-5', 3, 1, 'identity', 'Need: to answer “Who am I?” — peer group, vocation, sexuality.', { identity: 'ATI reference: identity, group, vocation, sexuality.' }, '“Who am I?” = identity.', [ES.ATIM]),
  stQ('g3-6', 3, 2, 'trust', 'Behavior: calm in the parent’s arms, cries when handed to a stranger.', { trust: 'Lecture: “you hand this kid to mommy — are they gonna cry? No. To a stranger? Yes.”', autonomy: 'Separation anxiety continues in toddlers, but trusting the parent vs. a stranger is the infant’s core task.' }, 'Parent vs. stranger = trust.', [ES.L930]),
  stQ('g3-7', 3, 2, 'initiative', 'Behavior: pours her own milk, spills it, then stares and asks, “Are you mad at me?”', { initiative: 'Lecture example of GUILT in the initiative stage.', autonomy: 'She STARTED the task unprompted and feels guilty — initiative vs. guilt.' }, 'Guilt after trying = initiative vs. guilt.', [ES.L930]),
  stQ('g3-8', 3, 2, 'industry', 'Behavior: draws pictures and expects every one on the fridge; joins a team sport.', { industry: 'Lecture: “industry is creativeness” — fridge art, team sports.', initiative: 'Pretend/imaginative play is initiative; producing work and team sports is industry.' }, 'Creating + teams = industry.', [ES.L930, ES.PPTB]),
  stQ('g3-9', 3, 2, 'identity', 'Behavior: joins a clique and changes music and fashion style.', { identity: 'Lecture: cliques, music, fashion = trying to find identity.' }, 'Cliques & style = identity.', [ES.L930]),
  stQ('g3-10', 3, 2, 'autonomy', 'Behavior: begins toilet training, feeds and undresses self, plays beside (not with) others.', { autonomy: 'ATI toddler milestones; PowerPoint: toddler parallel play.', initiative: 'Associative play is preschool; parallel play is toddler.' }, 'Parallel play + toileting = toddler.', [ES.ATIM, ES.PPTB]),
  stQ('g3-11', 3, 3, 'initiative', 'Unresolved conflict: the child waits to be told what to do before every single action.', { initiative: 'Lecture: guilt = “tell me what to do before I do it” — cannot progress to industry.', autonomy: 'Shame/doubt is about independence; failing to START tasks is guilt (initiative).' }, 'Never starting = guilt.', [ES.L930]),
  stQ('g3-12', 3, 3, 'industry', 'Unresolved conflict: the child sits on the sidelines and cannot bond with the team.', { industry: 'Lecture: kids who cannot socialize with a team = inferiority.', identity: 'Peer groups matter to teens too, but team sports and skill comparison are the school-age task.' }, 'Sidelined from the team = inferiority.', [ES.L930]),
  stQ('g3-13', 3, 3, 'trust', 'Root problem: the child never learned that caregivers will be there, so cannot venture off alone.', { trust: 'Lecture: a child who never develops trust cannot develop autonomy — the earlier stage is unresolved.', autonomy: 'The FAILURE shows up in autonomy, but the unresolved stage is trust.' }, 'Which stage was never completed? The earlier one.', [ES.L930]),
  stQ('g3-14', 3, 3, 'industry', 'A reward chart only praises finished tasks; a child who cannot finish begins to feel worthless. Which conflict is at risk?', { industry: 'ATI Ch6: reward systems for successful mastery can create inferiority in children unable to complete tasks.', initiative: 'Guilt follows failed attempts to start; feeling less capable than others at tasks = inferiority.' }, 'Feeling less capable at tasks = inferiority.', [ES.ATI6]),
  stQ('g3-15', 3, 3, 'identity', 'Must hide who they are from family and friends; the lecture links this to intimacy problems in adulthood.', { identity: 'Lecture: unresolved identity → intimacy problems; suicide peaks 12–18.' }, 'Hiding true self = role confusion.', [ES.L930]),
];

/* GAME 4 — identify the stage from a clinical scenario (Erikson is never named) */
export const G4: EQ[] = [
  stQ('g4-1', 4, 1, 'trust', 'A 9-month-old screams when the nurse picks him up and quiets as soon as his mother holds him.', { trust: 'Infant (birth–1 y): trusts the parent, not the stranger.' }, 'Age 9 months + parent/stranger.', [ES.L930, ES.ATIM]),
  stQ('g4-2', 4, 1, 'autonomy', 'A 2-year-old pushes the nurse’s hand away and shouts “Me do it!” while putting on socks.', { autonomy: 'Toddler (1–3 y): independence.' }, '2 years + doing it alone.', [ES.L930, ES.ATIM]),
  stQ('g4-3', 4, 1, 'industry', 'An 8-year-old is upset about missing soccer games and his class science project and asks for his homework.', { industry: 'School-age: skills, accomplishments, team sports, school.' }, 'Team + school projects.', [ES.L930, ES.T31H]),
  stQ('g4-4', 4, 1, 'identity', 'A 15-year-old refuses to wear a hospital gown in front of friends and asks her parents to step out during the exam.', { identity: 'Adolescent: body image, peers, privacy.' }, 'Teen + peers + privacy.', [ES.T31H, ES.ATIM]),
  stQ('g4-5', 4, 2, 'initiative', 'A 5-year-old insists on choosing her own pajamas and asks, “Did I make my tummy sick because I was bad?”', { initiative: 'Age 5 is still preschool; illness seen as punishment (textbook Box 31.3).', industry: 'Trap: 5 is NOT school-age (review #26).' }, 'Age 5 + guilt/punishment thinking.', [ES.T31O, ES.REV, ES.L930]),
  stQ('g4-6', 4, 2, 'autonomy', 'A toilet-trained 30-month-old begins wetting the bed during hospitalization and has tantrums at bedtime.', { autonomy: 'Toddler: tantrums and regression under stress (textbook Table 31.7).', trust: '30 months is past infancy.' }, '30 months = toddler; regression is expected.', [ES.T31H, ES.L930]),
  stQ('g4-7', 4, 2, 'industry', 'An 11-year-old builds models in the playroom and compares his work with his roommate’s.', { industry: 'School-age: models, hobbies, comparing achievements.', identity: 'An 11-year-old is still school-age (6–12).' }, 'Hobbies + comparison.', [ES.PPTB, ES.ATI6]),
  stQ('g4-8', 4, 2, 'initiative', 'A 4-year-old plays “doctor” with dolls and puts a bandage on every tiny scratch.', { initiative: 'Preschool: pretend play; fears bodily harm.' }, 'Pretend play + body-harm fear.', [ES.PPTB, ES.ATIM]),
  stQ('g4-9', 4, 3, 'identity', 'A 13-year-old after surgery keeps asking what her classmates will think of the scar.', { identity: 'Adolescent surgery fears: body image, peers’ reactions to scars (textbook Table 31.8).', industry: 'Age 13 is adolescent in every source; concern is image, not skill.' }, 'Scar + classmates = body image.', [ES.T31H]),
  stQ('g4-10', 4, 3, 'trust', 'A 3-month-old settles quickly when fed and held by the same caregivers each day.', { trust: 'Consistent, loving care builds trust (PowerPoint).' }, 'Same caregivers, needs met.', [ES.PPTB]),
  stQ('g4-11', 4, 3, 'industry', 'A 7-year-old with diabetes beams when she does her own fingerstick correctly and records the number.', { industry: 'Accomplishing a real task = industry (ATI Ch6).', initiative: 'At 7 she is school-age; mastering a skill, not pretend play.' }, 'Mastering a task at 7.', [ES.ATI6]),
  stQ('g4-12', 4, 3, 'identity', 'A 12-year-old wants to wear her own clothes, keeps her phone to text friends, and says her parents “don’t get it.”', { identity: 'At the 12-year boundary, look at the BEHAVIOR: peers, image, rejecting parents = identity (developmental, not chronologic, approach — textbook Ch31).', industry: 'Age 12 overlaps school-age, but these behaviors are adolescent.' }, 'Boundary age → judge by behavior.', [ES.T31O, ES.T31H, ES.ATIM]),
];

/* GAME 5 — best nursing intervention (every option explained) */
const g5 = (id: string, level: 1 | 2 | 3, stage: StageId, prompt: string, options: [string, string][], clue: string, src: string[]): EQ => ({ id, game: 5, level, stage, prompt, options, answer: 0, clue, src });
export const G5: EQ[] = [
  g5('g5-1', 1, 'trust', 'A 10-month-old is admitted for several days. Which nursing action best supports the infant’s psychosocial development?', [
    ['Encourage rooming-in and assign the same nurse when possible', 'Textbook Table 31.7: infants fear separation/distrust → rooming-in, teach parents, same nurse.'],
    ['Rotate nurses so the infant gets used to new people', 'Inconsistent caregivers work against trust.'],
    ['Ask parents to visit less because the infant cries when they leave', 'Separation is the infant’s biggest stressor; parents are partners, not visitors (textbook Ch31).'],
    ['Leave the infant to cry so he learns to self-soothe', 'Unmet needs build mistrust; comfort measures are recommended.'],
  ], 'Infant → consistency → trust.', [ES.T31H, ES.PPTB]),
  g5('g5-2', 1, 'autonomy', 'A 2-year-old must take an oral antibiotic. Which statement by the nurse best supports development?', [
    ['“Do you want the purple cup or the syringe?”', 'Textbook Ch31: offer REAL choices only — control within limits supports autonomy.'],
    ['“Do you want to take your medicine now?”', 'A yes/no question when “no” isn’t allowed is not a real choice.'],
    ['“If you don’t take it, you’ll get a shot.”', 'Threats create fear and shame.'],
    ['Mix it into a full bottle of milk without telling him', 'Textbook Ch31: never mix medicine in essential foods; full dose may not be taken.'],
  ], 'Toddler → real choices.', [ES.T31C]),
  g5('g5-3', 2, 'initiative', 'A 3-year-old needs an IV started this afternoon. What should the nurse do?', [
    ['Explain briefly right before the procedure and show it on a doll', 'Review #25 and textbook Ch31: prepare young children close to the time, concretely.'],
    ['Explain the procedure in detail a week ahead', 'Young children prepare close to the time; days of warning increase fear.'],
    ['Tell the child, “This won’t hurt at all”', 'Review #25: do not promise it won’t hurt — honesty builds trust.'],
    ['Say nothing to avoid upsetting the child', 'Children need honest, age-level preparation.'],
  ], 'Preschool → just-before, doll, honest.', [ES.REV, ES.T31C]),
  g5('g5-4', 2, 'initiative', 'A 4-year-old says, “I got sick because I hit my sister.” Best response?', [
    ['“Nothing you did made you sick.”', 'Textbook Box 31.3: preschoolers see illness as punishment — correct the guilt.'],
    ['“Maybe you should be nicer to her.”', 'Confirms the guilt belief.'],
    ['Change the subject so the child is not upset', 'Misses a chance to correct a frightening misconception.'],
    ['“You’re too little to understand.”', 'Dismissive; preschoolers need simple, honest explanations.'],
  ], 'Illness = punishment → correct it.', [ES.T31O]),
  g5('g5-5', 2, 'industry', 'A 9-year-old will be hospitalized for 2 weeks. Which intervention best supports development?', [
    ['Arrange schoolwork and phone or video calls with classmates', 'Textbook Table 31.7: school-age fear separation from friends/school → homework, friends visit/phone, include in decisions.'],
    ['Provide push-pull toys and large blocks', 'Toddler toys (PowerPoint).'],
    ['Keep visitors to parents only for infection control', 'Removes the peer contact school-age children need.'],
    ['Let the parents make every care decision', 'School-age children should be included in decisions.'],
  ], 'School-age → school + friends.', [ES.T31H, ES.PPTB]),
  g5('g5-6', 3, 'industry', 'A 7-year-old needs daily treatments. Which plan best supports her psychosocial stage?', [
    ['Challenge her with parts of the care she can successfully do, and praise her effort', 'ATI Ch6: challenge with tasks to accomplish; allow work through individual differences.'],
    ['Use a chart that gives rewards only when every step is perfect', 'ATI Ch6: rewarding only successful mastery can create inferiority in children who can’t complete it.'],
    ['Do every step for her so nothing goes wrong', 'Removes the chance to build competence.'],
    ['Compare her progress with a sibling who learned faster', 'Comparison invites inferiority.'],
  ], 'Industry → achievable tasks, not perfection-only rewards.', [ES.ATI6]),
  g5('g5-7', 1, 'identity', 'A 15-year-old is recovering from surgery. Which action best supports development?', [
    ['Include the teen in care decisions, provide privacy, and allow peer visits', 'Textbook Table 31.7: adolescents fear loss of control and separation from peers.'],
    ['Discuss the plan only with the parents', 'Excludes the teen; loss of control is a top fear.'],
    ['Limit visitors to family only', 'Peers are central in adolescence.'],
    ['Explain the procedure with a doll', 'Doll play suits preschoolers.'],
  ], 'Teen → control, privacy, peers.', [ES.T31H]),
  g5('g5-8', 2, 'identity', 'A 16-year-old says, “Promise you won’t tell anyone what I’m about to say.” Best response?', [
    ['Explain that most things stay private, but safety risks must be shared to get help', 'Review #30: confidentiality has limits when safety is at risk.'],
    ['Promise complete secrecy to build trust', 'Cannot be promised; harm must be reported.'],
    ['Tell the teen you must share everything with the parents', 'Breaks appropriate adolescent confidentiality.'],
    ['Change the subject', 'Misses a chance to hear a possible safety concern.'],
  ], 'Teen privacy WITH limits.', [ES.REV, ES.T30]),
  g5('g5-9', 3, 'identity', 'A 14-year-old is scheduled for surgery and is anxious. Which preparation fits the stage?', [
    ['Reassure that only the planned procedure will be done and introduce a peer who had the same surgery', 'Textbook Table 31.8: adolescent fears body image, loss of control, peers’ reactions to scars.'],
    ['Show the recovery room and say when parents can visit', 'Textbook Table 31.8 suggestion for children under 5.'],
    ['Show the mask and call anesthesia a “special sleep”', 'Textbook Table 31.8 suggestion for school-age children.'],
    ['Wait until the morning of surgery to give any information', 'Adolescents should be prepared as far in advance as possible (textbook Ch31).'],
  ], 'Match the prep to the age group’s fear.', [ES.T31H]),
  g5('g5-10', 3, 'industry', 'An 8-year-old has repeated morning stomachaches, but exams and labs are normal; he worries about schoolwork and peers. What should the nurse reinforce?', [
    ['He is healthy and should return to school right away, with support for his school and peer worries', 'Textbook Ch32 school avoidance: convince parents the child is healthy, return to school immediately, support peer/academic anxiety.'],
    ['Keep him home until the stomachaches stop', 'Staying home rewards avoidance (secondary gain).'],
    ['Tell him his pain is fake', 'Symptoms come from anxiety; dismissing him is not supportive.'],
    ['Schedule more diagnostic tests', 'Tests are usually not indicated once organic causes are ruled out.'],
  ], 'School-age + school worries → return to school.', [ES.T32]),
  g5('g5-11', 2, 'autonomy', 'An 18-month-old is hospitalized and the parents must leave for work. Which action best supports development?', [
    ['Keep the child’s home routines and bedtime rituals and set gentle limits', 'Textbook Table 31.7: toddlers — praise, set limits, maintain home routines/rituals.'],
    ['Change to the unit’s schedule so the child adjusts faster', 'Losing familiar routines increases distress.'],
    ['Scold the child for tantrums so they stop', 'Shaming works against autonomy.'],
    ['Restrain the child in the crib for safety all day', 'Restraints are for procedures only, as a last resort (textbook Ch31).'],
  ], 'Toddler → routines, rituals, limits.', [ES.T31H, ES.T31C]),
  g5('g5-12', 3, 'initiative', 'A 4-year-old is scheduled for surgery tomorrow and asks, “What happens when I wake up?” Best response?', [
    ['Show the recovery room and say when her parents will be with her', 'Textbook Table 31.8: under 5 — what happens when I wake, who will be with me.'],
    ['Describe the anesthesia drugs in detail', 'Too abstract for a preschooler.'],
    ['Tell her she will not feel anything at all', 'Avoid promises that may not be true.'],
    ['Say adults will explain later', 'Leaves her fear unaddressed.'],
  ], 'Under 5 → where, who, when.', [ES.T31H]),
];

/* ------------------------------------------------------------------ rapid recall bank */
export interface RQ { id: string; prompt: string; options: string[]; answer: number; why: string; stage: StageId | 'mixed' }
export function rapidBank(): RQ[] {
  const out: RQ[] = [];
  STAGES.forEach((s, i) => {
    out.push({ id: 'r-age-' + s.id, prompt: `${s.group} (${s.ages}) = ?`, options: STAGE_NAMES, answer: i, why: `${s.group} → ${s.stage}.`, stage: s.id });
    out.push({ id: 'r-stage-' + s.id, prompt: `${s.stage} = which age group?`, options: STAGES.map(x => `${x.group} ${x.ages}`), answer: i, why: `${s.stage}: ${s.group}, ${s.ages}.`, stage: s.id });
    out.push({ id: 'r-num-' + s.id, prompt: `Which is stage #${s.n}?`, options: STAGE_NAMES, answer: i, why: `#${s.n} is ${s.stage}. T-A-I-I-I.`, stage: s.id });
    out.push({ id: 'r-hook-' + s.id, prompt: `${s.hook}`, options: STAGE_NAMES, answer: i, why: `${s.hook} = ${s.positive}.`, stage: s.id });
    out.push({ id: 'r-play-' + s.id, prompt: `Play: ${s.play.split(' — ')[0]}`, options: STAGE_NAMES, answer: i, why: `PowerPoint activity table: ${s.group}.`, stage: s.id });
    out.push({ id: 'r-nurse-' + s.id, prompt: `Nursing: ${s.nursing[0]}`, options: STAGE_NAMES, answer: i, why: `${s.nursing[0]} supports ${s.positive.toLowerCase()}.`, stage: s.id });
    if (i < 4) out.push({ id: 'r-next-' + s.id, prompt: `Which stage comes right AFTER ${s.stage}?`, options: STAGE_NAMES, answer: i + 1, why: `${s.stage} → ${STAGES[i + 1].stage}.`, stage: STAGES[i + 1].id });
  });
  out.push({ id: 'r-trap-1', prompt: 'Erikson’s stages are…', options: ['Psychosocial', 'Psychosexual', 'Cognitive', 'Moral'], answer: 0, why: 'Erikson = psychosocial; Freud = psychosexual; Piaget = cognitive.', stage: 'mixed' });
  return out;
}

/* ------------------------------------------------------------------ final assessment (15) */
export const ASSESS_EXTRA: EQ[] = [
  { id: 'fa-order', game: 7, level: 2, stage: 'mixed', prompt: 'Which list shows Erikson’s stages in the correct order from birth?', options: [
    ['Trust → Autonomy → Initiative → Industry → Identity', 'T-A-I-I-I (lecture; PowerPoint).'],
    ['Trust → Initiative → Autonomy → Industry → Identity', 'Autonomy (toddler) comes before initiative (preschool).'],
    ['Autonomy → Trust → Industry → Initiative → Identity', 'Trust is first; it is the foundation.'],
    ['Trust → Autonomy → Industry → Initiative → Identity', 'Initiative (preschool) comes before industry (school-age).'],
  ], answer: 0, clue: 'T-A-I-I-I.', src: [ES.L930, ES.PPTB] },
  { id: 'fa-trap', game: 7, level: 2, stage: 'mixed', prompt: 'A classmate says, “Erikson’s stages are psychosexual, like oral and anal.” Which correction is accurate?', options: [
    ['Erikson’s stages are psychosocial; oral and anal are Freud’s psychosexual stages', 'Keep the theorists separate.'],
    ['Correct — Erikson and Freud use the same stages', 'They are different theories.'],
    ['Erikson’s stages are cognitive, like sensorimotor', 'Sensorimotor is Piaget.'],
    ['Erikson only describes adolescents', 'Erikson covers birth onward.'],
  ], answer: 0, clue: 'Erikson = psychoSOCIAL.', src: [ES.ATIM, ES.PPTB] },
  { id: 'fa-progress', game: 7, level: 3, stage: 'mixed', prompt: 'According to your lecture, what happens if a stage is not resolved?', options: [
    ['The child has trouble progressing to the next stage', 'Lecture: “you’ve got to get through this stage in order to progress to the next.”'],
    ['The stage is skipped with no effect', 'Stages build on one another.'],
    ['The child returns to infancy permanently', 'Temporary regression under stress is different.'],
    ['Nothing — the stages are unrelated', 'The lecture stresses the progression.'],
  ], answer: 0, clue: 'Stages are stacked like a house.', src: [ES.L930] },
];
export const MASTERY_TARGET = 0.85;
