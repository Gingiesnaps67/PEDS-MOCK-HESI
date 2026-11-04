/**
 * Growth & Development Mastery Center — SOURCE-LOCKED content.
 * Age bands follow the ATI milestone reference (Infant birth–1 y, Toddler 1–3, Preschool 3–6,
 * School-age 6–12, Adolescent 12–20). Bands overlap at their edges exactly as the source writes them.
 */
import { S } from './rapid';

export type Domain = 'physical' | 'gross' | 'fine' | 'language' | 'piaget' | 'erikson' | 'freud' | 'play' | 'nutrition' | 'safety' | 'teaching' | 'warning';
export const DOMAINS: { id: Domain; label: string }[] = [
  { id: 'physical', label: 'Physical growth' }, { id: 'gross', label: 'Gross motor' }, { id: 'fine', label: 'Fine motor' },
  { id: 'language', label: 'Language' }, { id: 'piaget', label: 'Piaget' }, { id: 'erikson', label: 'Erikson' },
  { id: 'freud', label: 'Freud' }, { id: 'play', label: 'Play' }, { id: 'nutrition', label: 'Nutrition' },
  { id: 'safety', label: 'Safety' }, { id: 'teaching', label: 'Parent teaching' }, { id: 'warning', label: 'Warning signs' },
];

export interface Stage {
  id: 'infant' | 'toddler' | 'preschool' | 'school' | 'adolescent';
  name: string; band: string; color: string; analogy: string;
  erikson: string; piaget: string; freud: string;
  rows: { label: string; text: string; src: string; flag?: string }[];
}

export const STAGES: Stage[] = [
  { id: 'infant', name: 'Infant', band: 'Birth–1 year', color: 'purple',
    analogy: 'An infant is a new phone being set up: first it learns to trust its "network" (caregivers), then it downloads the senses and motor apps one by one, head first.',
    erikson: 'Trust vs mistrust', piaget: 'Sensorimotor (0–2 y)', freud: 'Oral',
    rows: [
      { label: 'Physical growth', text: 'Weight doubles by ~6 months and triples by 1 year; length +50% by 1 year. Posterior fontanel closes 2–3 months; anterior 12–18 months.', src: S.PPTB },
      { label: 'Gross motor', text: '1 mo lifts head briefly · 2–3 mo head 45° · 4–5 mo rolls front-to-back · 6–7 mo sits with support · 8–9 mo sits alone, crawls · 10–12 mo pulls to stand, cruises, may walk.', src: S.PPTB },
      { label: 'Fine motor', text: 'Grasps 1 mo · hands together 4 mo · transfers hand-to-hand 6 mo · thumb (pincer) grasp 9 mo · bangs two toys 9 mo · nests 12 mo.', src: S.ATIM },
      { label: 'Language', text: '2 mo coos/social smile · 4 mo laughs, babbles · 6 mo responds to name · 9 mo understands "no," mama/dada nonspecific · 12 mo 3–5 words with meaning.', src: S.PPTB },
      { label: 'Cognitive', text: 'Object permanence develops (~9 months); discriminates familiar people 4–6 months.', src: S.PPTB },
      { label: 'Psychosocial', text: 'Stranger and separation anxiety begin 6–8 months; distinguishes self from parents by 1 year.', src: S.ATIM },
      { label: 'Play', text: 'Solitary, sensory: rattles, mobiles, soft toys, teething rings, peek-a-boo, mirrors, tummy time, pat-a-cake, nesting toys.', src: S.PPTB },
      { label: 'Nutrition', text: 'Breast milk or iron-fortified formula; solids 4–6 months starting with iron-fortified cereal; one new food per week; NO honey and NO cow’s milk before 12 months.', src: S.T31 },
      { label: 'Health promotion', text: 'Hep B at birth; 2-4-6-month vaccine series; dental care from the first tooth; no bottle in bed.', src: S.PPTB },
      { label: 'Injury prevention', text: 'Back to sleep on a firm surface; never alone on raised surfaces once rolling (4–5 mo); rear-facing car seat; choking hazards.', src: S.T31 },
      { label: 'Warning signs', text: 'No words at 12 months → check hearing first; closed anterior fontanel at 6 months → notify provider; persistent primitive reflexes.', src: S.L930 },
    ] },
  { id: 'toddler', name: 'Toddler', band: '1–3 years', color: 'purple',
    analogy: 'A toddler is a new driver with no brakes: lots of "go" (walking, climbing, "NO!"), very little sense of danger — so the adults supply the guardrails.',
    erikson: 'Autonomy vs shame & doubt', piaget: 'Sensorimotor → preoperational', freud: 'Anal',
    rows: [
      { label: 'Physical growth', text: 'Anterior fontanel closed by 18 months; birth weight ×4 by about 30 months (ATI) / by 3 y (textbook); grows ~3 in/yr; physiologic anorexia.', src: S.ATIM, flag: 'Weight ×4: ATI 30 mo vs textbook 3 y.' },
      { label: 'Gross motor', text: 'Steady gait, climbs stairs, jumps, stands on one foot.', src: S.ATIM },
      { label: 'Fine motor', text: 'Stacks blocks, scribbles/draws, undresses and feeds self.', src: S.ATIM },
      { label: 'Language', text: '18 mo about 25–50 words; 2 y more than 250 words, 2–3-word sentences.', src: S.T31 },
      { label: 'Cognitive', text: 'Object permanence and memory; symbolizes objects; magical/egocentric thinking.', src: S.ATIM },
      { label: 'Psychosocial', text: 'Independence; separation anxiety greatest 15–30 months; gender identity by 3; regression under stress.', src: S.T31 },
      { label: 'Moral', text: 'Egocentric; punishment-and-obedience orientation.', src: S.ATIM },
      { label: 'Play', text: 'PARALLEL play (instructor); push-pull toys, large blocks, scribbling, fill-and-empty containers.', src: S.L930, flag: 'ATI lists "solitary" play for toddlers (D6).' },
      { label: 'Nutrition', text: 'Whole milk until age 2 (instructor deck); limit milk that displaces iron; small portions; no forcing.', src: S.PPTB, flag: 'Textbook Ch30 allows whole or 2%; Ch31 says low-fat (D23).' },
      { label: 'Health promotion', text: 'Consistent discipline by all caregivers; toilet training; tantrums; dental caries prevention.', src: S.L930 },
      { label: 'Injury prevention', text: 'Poisoning (highest risk 1–2 y), drowning, burns, falls, choking; car seat rear-facing at least to 2.', src: S.T30 },
      { label: 'Warning signs', text: 'Loss of previously gained skills (regression beyond stress); no pointing/waving; no eye contact.', src: S.PPTB },
    ] },
  { id: 'preschool', name: 'Preschool', band: '3–6 years', color: 'purple',
    analogy: 'A preschooler is a movie director: everything is imaginary, everything is about them, and a scraped knee looks like a disaster film.',
    erikson: 'Initiative vs guilt', piaget: 'Preoperational (preconceptual → intuitive)', freud: 'Phallic',
    rows: [
      { label: 'Physical growth', text: 'Gains about 5 lb/yr; grows 2.5–3 in/yr.', src: S.ATIM },
      { label: 'Gross motor', text: 'Alternates feet on stairs, hops, heel-to-toe walk; rides a tricycle.', src: S.ATIM },
      { label: 'Fine motor', text: 'Copies shapes; dresses without help.', src: S.ATIM },
      { label: 'Language', text: 'Speaks in sentences; names colors; enjoys talking.', src: S.ATIM },
      { label: 'Cognitive', text: 'Magical thinking (animism, artificialism, imminent justice); comprehends days of the week; illness = punishment.', src: S.ATIM },
      { label: 'Psychosocial', text: 'Guilt when unable to do something; may regress; greatest fear = bodily harm/mutilation.', src: S.ATIM },
      { label: 'Moral', text: 'Good vs bad; consequences.', src: S.ATIM },
      { label: 'Play', text: 'ASSOCIATIVE, imaginative play: dress-up, pretend, ROLE-PLAY, puzzles, tricycles, simple crafts.', src: S.PPTB },
      { label: 'Nutrition', text: 'About half an adult portion; picky eating to about age 5.', src: S.ATIM },
      { label: 'Health promotion', text: 'Vision, hearing, dental screening; DTaP, MMR, varicella, IPV at 4–6 y; ~12 h sleep.', src: S.ATIM },
      { label: 'Injury prevention', text: 'Playground and tricycle safety, strangers, drowning, poisoning; teach name/address/phone; never touch guns.', src: S.T31 },
      { label: 'Warning signs', text: 'Persistent separation anxiety beyond 3–4 years can underlie school avoidance later.', src: S.T32 },
    ] },
  { id: 'school', name: 'School-age', band: '6–12 years', color: 'purple',
    analogy: 'A school-age child is a scout earning badges: rules, collections, teams, and "I can do it" (industry).',
    erikson: 'Industry vs inferiority', piaget: 'Concrete operations', freud: 'Latency',
    rows: [
      { label: 'Physical growth', text: 'About 4.4–6.6 lb and 2.4–2.8 in per year (ATI Ch6); permanent teeth begin ~6 y; prepubescence ~10 y (girls first).', src: S.ATI6, flag: 'ATI milestone reference says 4.4–8.8 lb & ~2 in/yr (D7).' },
      { label: 'Gross / fine motor', text: 'Improved coordination; visual acuity 20/20.', src: S.ATIM },
      { label: 'Cognitive', text: 'Conservation (mass → weight → volume), classifying, telling time, simple analogies, others’ perspectives.', src: S.ATI6 },
      { label: 'Psychosocial', text: 'Same-sex peer groups; fears ridicule; teachers and peers gain importance; bullying risk.', src: S.ATI6 },
      { label: 'Moral', text: 'Early: rewards and punishment; later: intentions, golden rule.', src: S.ATI6 },
      { label: 'Self-concept / body image', text: 'Body image solidifies; modesty and privacy; curiosity about sexuality.', src: S.ATI6 },
      { label: 'Play', text: 'Rule-based: board and card games, jump rope, collections, bikes, models, organized sports, clubs.', src: S.ATI6 },
      { label: 'Nutrition', text: 'Adult guidelines by the end of the stage; nutritious snacks; obesity prevention.', src: S.ATI6 },
      { label: 'Health promotion', text: 'Scoliosis screening during growth spurts; 9–12 h sleep; brush twice daily; Tdap/HPV/meningococcal at 11–12.', src: S.ATI6 },
      { label: 'Injury prevention', text: 'Helmets/pads, swim lessons, firearms locked, booster until belt fits, back seat until 12.', src: S.ATI6 },
      { label: 'Warning signs', text: 'Recurrent vague morning complaints that improve when allowed to stay home = possible school avoidance.', src: S.T32 },
    ] },
  { id: 'adolescent', name: 'Adolescent', band: '12–20 years (as in the source)', color: 'purple',
    analogy: 'An adolescent is an actor trying on costumes in front of a mirror and an audience of peers: "Who am I?" — and sure the stage will never collapse.',
    erikson: 'Identity vs role confusion', piaget: 'Formal operations (abstract)', freud: 'Genital',
    rows: [
      { label: 'Physical growth', text: 'Growth spurt and sexual maturation; females reach adult height ~13, males ~15; acne.', src: S.ATIM },
      { label: 'Cognitive', text: 'Abstract, adult-level thinking; can evaluate own thinking.', src: S.ATIM },
      { label: 'Psychosocial', text: 'Identity, peer group, vocation, sexuality; feels indestructible; may deny illness.', src: S.ATIM },
      { label: 'Moral', text: 'Conventional law-and-order; questions rules (not absolutes).', src: S.ATIM },
      { label: 'Self-concept / body image', text: 'Body image central; fears loss of control and peers’ reactions (scars).', src: S.T31 },
      { label: 'Play / activities', text: 'Nonviolent video games and music, sports, pet care, career-training programs, reading, social events.', src: S.ATIM },
      { label: 'Nutrition', text: 'Often deficient in iron, calcium, vitamins A and C; risk of anorexia, bulimia, obesity.', src: S.ATIM },
      { label: 'Health promotion', text: 'Confidential screening for substance use, sexual activity, and depression; HPV; STI/pregnancy prevention.', src: S.L930 },
      { label: 'Injury prevention', text: 'Driver education, seat belts, no driving after alcohol/drugs, helmets, firearms locked with ammunition separate.', src: S.ATIM },
      { label: 'Warning signs', text: 'Giving away possessions, preoccupation with death, withdrawal, grade drop, sudden calm → ask directly about suicide and a plan.', src: S.T32 },
    ] },
];

/* ------------------------------------------------------------------ TIMELINE CHECKPOINTS */
export interface Checkpoint {
  age: string; stage: Stage['id'];
  milestones: string[]; safety: string; why: string; teaching: string; activities: string; src: string[];
  q: { stem: string; options: string[]; answer: number; why: string };
}
const cp = (c: Checkpoint) => c;
export const CHECKPOINTS: Checkpoint[] = [
  cp({ age: 'Birth', stage: 'infant', milestones: ['Obligate nose breather (until 3–4 weeks)', 'Vision ~20/400; focuses ~8 inches', 'Irregular respiratory rhythm is normal'],
    safety: 'Back to sleep, firm mattress, nothing soft in the crib.', why: 'Cannot lift or turn the head away from bedding.', teaching: 'Hep B vaccine; bulb-suction the nose before feeds if congested.', activities: 'Faces at close range, soft voices.', src: [S.T31, S.T32, S.PPTB],
    q: { stem: 'Why does nasal congestion make feeding hard for a newborn?', options: ['Newborns are obligate nose breathers', 'Newborns cannot swallow', 'The anterior fontanel is open', 'Newborn RR is regular'], answer: 0, why: 'Textbook Ch31: newborns are obligate nasal breathers until about 3–4 weeks.' } }),
  cp({ age: '2 months', stage: 'infant', milestones: ['Coos, social smile', 'Lifts head ~45° prone (2–3 mo)', 'Posterior fontanel closes (2–3 mo)'],
    safety: 'Never leave on a raised surface; rolling starts soon.', why: 'Motor control is developing head-down (cephalocaudal).', teaching: '2-month vaccines: DTaP, IPV, Hib, PCV, RV, Hep B #2.', activities: 'Mobiles, rattles, talking face to face.', src: [S.PPTB],
    q: { stem: 'Which fontanel closes by about 2–3 months?', options: ['Posterior', 'Anterior', 'Both', 'Neither until 18 months'], answer: 0, why: 'Posterior 2–3 months; anterior 12–18 months (course PowerPoint; lecture 9/30).' } }),
  cp({ age: '3 months', stage: 'infant', milestones: ['Holds head up', 'Works to reach toys (3–5 mo)'],
    safety: 'Check toys for small parts.', why: 'Hands begin reaching and mouthing.', teaching: 'Tummy time while awake and supervised.', activities: 'Rattles, soft toys.', src: [S.ATIM, S.T31],
    q: { stem: 'A 3-month-old cannot hold the head up when pulled to sit. The nurse should:', options: ['Report it for further evaluation', 'Reassure — this appears at 9 months', 'Ignore head control until walking', 'Start solids'], answer: 0, why: 'ATI: holds head up at 3 months — a missing milestone is reported (review #28).' } }),
  cp({ age: '4 months', stage: 'infant', milestones: ['Laughs, babbles', 'Rolls front-to-back (4–5 mo)', 'Brings hands together'],
    safety: 'Never alone on a bed or changing table — one hand on the baby.', why: 'Rolling = first fall risk ("they love asking about 4–6 months").', teaching: '4-month vaccines; solids may start at 4–6 months once head control is good.', activities: 'Peek-a-boo, mirrors.', src: [S.PPTB, S.L930, S.T31],
    q: { stem: 'Which safety teaching matches a 4-month-old’s new skill?', options: ['Keep a hand on her on the changing table', 'Install stair gates', 'Lock up matches', 'Remove refrigerator doors'], answer: 0, why: 'Rolling begins 4–5 months (course PowerPoint).' } }),
  cp({ age: '6 months', stage: 'infant', milestones: ['Sits with support (6–7 mo)', 'Transfers objects hand to hand', 'Responds to name', 'Weight doubled'],
    safety: 'Choking: no grapes, nuts, popcorn; check small parts.', why: 'Transfers and mouths everything.', teaching: 'Iron-fortified cereal; one new food per week; 6-month vaccines + flu.', activities: 'Teething rings, banging toys.', src: [S.PPTB, S.T31],
    q: { stem: 'A 7-lb newborn should weigh about how much at 6 months?', options: ['14 lb', '21 lb', '10 lb', '28 lb'], answer: 0, why: 'Birth weight doubles by about 6 months (course PowerPoint; lecture 9/30).' } }),
  cp({ age: '9 months', stage: 'infant', milestones: ['Sits alone, crawls (8–9 mo)', 'Pincer grasp begins', 'Understands "no"; mama/dada nonspecific', 'Object permanence'],
    safety: 'Stair gates top and bottom; outlet covers; lock medicines.', why: 'Crawling + pincer grasp = reaches small objects and stairs.', teaching: 'Anticipatory guidance: childproof before crawling (textbook example 9–10 months).', activities: 'Nesting toys, pat-a-cake, books.', src: [S.PPTB, S.T31],
    q: { stem: 'A deaf infant would most likely show which sign by 9 months?', options: ['No babbling', 'Rolling late', 'Early walking', 'Pincer grasp'], answer: 0, why: 'Textbook Ch31: hearing impairment at 9 months — no babbling, cannot imitate sounds.' } }),
  cp({ age: '12 months', stage: 'infant', milestones: ['Pulls to stand, cruises, may walk', '3–5 words with meaning', 'Weight tripled; length +50%', 'Separation anxiety'],
    safety: 'Water: never alone in tub; poisoning risk rising.', why: 'Walking + curiosity.', teaching: 'Switch to whole cow’s milk now; MMR & varicella (live) now.', activities: 'Push-pull toys, blocks, books.', src: [S.PPTB, S.L930],
    q: { stem: 'A 12-month-old says no words. First action?', options: ['Check hearing', 'Wait until 2 years', 'Diagnose autism', 'Start speech therapy without evaluation'], answer: 0, why: 'Lecture 9/30: no words at 12 months → check the ears first.' } }),
  cp({ age: '15 months', stage: 'toddler', milestones: ['Walking; table foods (12–15 mo)', 'Separation anxiety peaks 15–30 months'],
    safety: 'Poisoning: lock cleaners and medicines.', why: 'Climbs and opens containers.', teaching: 'Wean from the bottle by about 15 months.', activities: 'Push-pull toys, fill-and-empty.', src: [S.T31],
    q: { stem: 'By about what age does the textbook suggest weaning from the bottle?', options: ['15 months', '6 months', '3 years', '5 years'], answer: 0, why: 'Textbook Ch31: wean the bottle by about 15 months.' } }),
  cp({ age: '18 months', stage: 'toddler', milestones: ['Anterior fontanel closed (12–18 mo)', '25–50 words', 'Climbs stairs'],
    safety: 'Falls and climbing; fenced pools.', why: 'Mobility outpaces judgment.', teaching: 'Autism screening at 18 and 24 months (textbook Ch32/AAP).', activities: 'Large blocks, scribbling, parallel play.', src: [S.PPTB, S.T31, S.T32],
    q: { stem: 'An open anterior fontanel at 2 years should be:', options: ['Reported', 'Expected', 'Massaged', 'Ignored until 5 years'], answer: 0, why: 'Lecture 9/30: closes 12–18 months; a 2-year-old with an open anterior fontanel → report.' } }),
  cp({ age: '24 months', stage: 'toddler', milestones: ['More than 250 words; 2–3-word sentences', 'Parallel play', 'Autonomy — "No!"'],
    safety: 'Rear-facing car seat at least to age 2.', why: 'Rear-facing protects the head/neck in a crash.', teaching: 'Whole milk until 2 (instructor deck); consistent discipline; toilet-training readiness.', activities: 'Parallel play, push-pull toys.', src: [S.T31, S.PPTH, S.L930],
    q: { stem: 'Which play is expected at 2 years?', options: ['Parallel', 'Cooperative team sports', 'Associative role-play', 'Abstract strategy games'], answer: 0, why: 'Lecture 9/30 and course PowerPoint: toddlers = parallel play.' } }),
  cp({ age: '30 months', stage: 'toddler', milestones: ['Birth weight ×4 (ATI: ~30 months)', 'Primary teeth complete ~2.5 years'],
    safety: 'Burns and scalds; water heater ≤120 °F.', why: 'Reaches counters and pot handles.', teaching: 'Brushing with parent help; first dental visit by 1 year if not yet.', activities: 'Scribbling, stacking.', src: [S.ATIM, S.T30],
    q: { stem: 'When are the 20 primary (deciduous) teeth usually complete?', options: ['About 2.5–3 years', '6 months', '6 years', '12 years'], answer: 0, why: 'Textbook Ch30: complete by 2.5 y; Ch31: all by the 3rd birthday.' } }),
  cp({ age: '3 years', stage: 'preschool', milestones: ['Gender identity', 'Bowel & bladder control by ~3', 'Gives up naps', 'Routine BP begins'],
    safety: 'Tricycle and playground supervision; strangers.', why: 'More independent play outside.', teaching: 'Explain procedures right before they happen; use dolls.', activities: 'Tricycle, dress-up, puzzles.', src: [S.ATIM, S.T31, S.PPTB],
    q: { stem: 'At what age does routine blood-pressure screening begin?', options: ['3 years', '1 year', '6 years', '12 years'], answer: 0, why: 'Course PowerPoint, ATI notes, lecture 9/30: from age 3.' } }),
  cp({ age: '4 years', stage: 'preschool', milestones: ['Speaks in sentences', 'Hops; alternates feet on stairs', 'Associative play'],
    safety: 'Teach name, address, phone; never touch guns.', why: 'Wanders and trusts strangers.', teaching: 'Fear of mutilation — use bandages; DTaP/MMR/varicella/IPV due 4–6 y.', activities: 'Role-play, pretend, crafts.', src: [S.ATIM, S.T31],
    q: { stem: 'A 4-year-old insists on a bandage over a tiny needle stick. This reflects:', options: ['Fear of body mutilation', 'Abstract thinking', 'Industry', 'Pain-seeking'], answer: 0, why: 'Preschoolers’ greatest fear is bodily harm (ATI; textbook Ch31).' } }),
  cp({ age: '5 years', stage: 'preschool', milestones: ['Still preschool range (3–6)', 'Dresses without help', 'Comprehends days of the week'],
    safety: 'Booster when outgrowing the harness seat.', why: 'Belt does not fit yet.', teaching: 'Vision/hearing screening before school.', activities: 'Simple crafts, books.', src: [S.ATIM, S.PPTH],
    q: { stem: 'Which developmental stage applies to a 5-year-old?', options: ['Preschool (initiative vs guilt)', 'School-age (industry)', 'Toddler (autonomy)', 'Adolescent (identity)'], answer: 0, why: 'Review #26 / ATI: preschool is 3–6 years.' } }),
  cp({ age: '6 years', stage: 'school', milestones: ['First permanent teeth ~6 y', 'Concrete thinking begins', 'Industry'],
    safety: 'Bike helmet; booster seat; back seat.', why: 'Rides bikes, crosses streets.', teaching: 'Brush twice daily; 9–12 h sleep.', activities: 'Board/number games, hopscotch, jump rope.', src: [S.ATI6],
    q: { stem: 'Which activity best fits a 6-year-old?', options: ['Jump rope', 'Career-training program', 'Peek-a-boo', 'Push-pull toy'], answer: 0, why: 'ATI Ch6 practice item: 6-year-old → jump rope.' } }),
  cp({ age: '9 years', stage: 'school', milestones: ['Conservation of weight', 'Collections, hobbies, clubs', 'Same-sex peer groups'],
    safety: 'Protective sports gear; firearms locked.', why: 'Organized sports and independence.', teaching: 'Scoliosis screening before/during growth spurts.', activities: 'Crafts, models, jigsaw puzzles, competitive sports.', src: [S.ATI6],
    q: { stem: 'A 9-year-old hospitalized for 2 weeks needs:', options: ['Schoolwork and contact with classmates', 'Parallel play', 'Rattles', 'No visitors'], answer: 0, why: 'Industry + peers: friends visit/phone, homework (textbook Ch31 Table 31.7).' } }),
  cp({ age: '12 years', stage: 'adolescent', milestones: ['Boundary age (school-age 6–12 / adolescent 12–20)', 'Puberty; growth spurt', 'Beginning abstract thought'],
    safety: 'Back seat until 12–13; helmets; online safety.', why: 'Risk-taking and peer pressure begin.', teaching: 'Tdap, HPV, meningococcal at 11–12; confidentiality and its limits.', activities: 'Nonviolent video games/music, reading, pet care, career programs.', src: [S.ATIM, S.ATI6],
    q: { stem: 'Which activity is listed for adolescents in the ATI reference?', options: ['Caring for a pet', 'Role-playing', 'Push-pull toys', 'Peek-a-boo'], answer: 0, why: 'ATI adolescent activities include pet care; role-play is preschool.' } }),
  cp({ age: 'Adolescence', stage: 'adolescent', milestones: ['Identity vs role confusion', 'Formal operations (abstract)', 'Adult height: girls ~13, boys ~15'],
    safety: 'Driver education; no driving impaired; firearms locked with ammunition separate.', why: 'Feels indestructible.', teaching: 'Ask directly about suicide and a plan; abstinence is the only 100% method; condoms.', activities: 'Sports, clubs, social events, volunteering.', src: [S.ATIM, S.L930, S.T30],
    q: { stem: 'A teen says, "Promise you won’t tell anyone." Best response?', options: ['Explain confidentiality and its safety limits', 'Promise total secrecy', 'Refuse to listen', 'Call the parents first'], answer: 0, why: 'Review #30: confidentiality has limits when safety is at risk.' } }),
];

/* ------------------------------------------------------------------ GAMES */
export interface GameQ { id: string; prompt: string; options: string[]; answer: number; why: string; src: string; domain: Domain }
const g = (id: string, domain: Domain, prompt: string, options: string[], answer: number, why: string, src: string): GameQ => ({ id, domain, prompt, options, answer, why, src });
const AGES = ['Infant', 'Toddler', 'Preschool', 'School-age', 'Adolescent'];

export const GAMES: { id: string; title: string; blurb: string; qs: GameQ[] }[] = [
  { id: 'age', title: 'Which Age Am I?', blurb: 'Read the finding, pick the age group.', qs: [
    g('a1', 'gross', '"I can pull to stand and cruise along the couch."', AGES, 0, '10–12 months (course PowerPoint).', S.PPTB),
    g('a2', 'play', '"I play next to you, not with you."', AGES, 1, 'Parallel play = toddler (lecture 9/30).', S.L930),
    g('a3', 'piaget', '"The moon follows me because it likes me."', AGES, 2, 'Animism / magical thinking = preschool preoperational (ATI).', S.ATIM),
    g('a4', 'piaget', '"The tall glass and the short glass have the same amount of juice."', AGES, 3, 'Conservation = school-age concrete operations (ATI Ch6).', S.ATI6),
    g('a5', 'erikson', '"Who am I, and where do I fit in?"', AGES, 4, 'Identity vs role confusion (lecture 9/30).', S.L930),
    g('a6', 'language', '"I say 25–50 words."', AGES, 1, '18 months (textbook Ch31).', S.T31),
    g('a7', 'nutrition', '"I eat about half an adult portion and I’m picky."', AGES, 2, 'Preschool (ATI).', S.ATIM),
    g('a8', 'fine', '"I just started using my thumb and finger to pick up a Cheerio."', AGES, 0, 'Pincer grasp begins 8–9 months (course PowerPoint).', S.PPTB),
    g('a9', 'erikson', '"I want to earn the badge and finish my model."', AGES, 3, 'Industry vs inferiority (6–12).', S.L930),
  ] },
  { id: 'theorist', title: 'Match the Theorist', blurb: 'Pick the stage that matches the theorist and age.', qs: [
    g('t1', 'erikson', 'Erikson — Toddler', ['Autonomy vs shame & doubt', 'Trust vs mistrust', 'Initiative vs guilt', 'Industry vs inferiority'], 0, 'Toddler 1–3 = autonomy.', S.L930),
    g('t2', 'erikson', 'Erikson — Preschool', ['Initiative vs guilt', 'Identity vs role confusion', 'Autonomy vs shame & doubt', 'Trust vs mistrust'], 0, 'Preschool = initiative.', S.L930),
    g('t3', 'piaget', 'Piaget — Infant', ['Sensorimotor', 'Preoperational', 'Concrete operations', 'Formal operations'], 0, 'Sensorimotor 0–2 y (course PowerPoint).', S.PPTB),
    g('t4', 'piaget', 'Piaget — School-age', ['Concrete operations', 'Formal operations', 'Preoperational', 'Sensorimotor'], 0, 'Concrete operations (ATI Ch6).', S.ATI6),
    g('t5', 'piaget', 'Piaget — Adolescent', ['Formal operations', 'Concrete operations', 'Preoperational', 'Sensorimotor'], 0, 'Abstract thought (ATI).', S.ATIM),
    g('t6', 'freud', 'Freud — Toddler', ['Anal', 'Oral', 'Phallic', 'Latency'], 0, 'Freud’s PSYCHOSEXUAL stages: oral, anal, phallic, latency, genital. (The ATI table labels the Freud row "psychosocial" — a labeling error, D1.)', S.ATIM),
    g('t7', 'freud', 'Freud — School-age', ['Latency', 'Genital', 'Anal', 'Oral'], 0, 'Latency (ATI reference).', S.ATIM),
    g('t8', 'freud', 'Freud — Infant', ['Oral', 'Anal', 'Phallic', 'Genital'], 0, 'Oral (ATI reference).', S.ATIM),
  ] },
  { id: 'sequence', title: 'Milestone Sequence', blurb: 'Which milestone comes FIRST?', qs: [
    g('q1', 'gross', 'Which appears first?', ['Lifts head 45° prone', 'Rolls front-to-back', 'Sits without support', 'Pulls to stand'], 0, '2–3 mo → 4–5 → 8–9 → 10–12 (course PowerPoint). Cephalocaudal: head before trunk before legs.', S.PPTB),
    g('q2', 'fine', 'Which appears first?', ['Transfers hand to hand', 'Pincer grasp', 'Nests objects', 'Copies shapes'], 0, '6 mo → 9 mo → 12 mo → preschool (ATI).', S.ATIM),
    g('q3', 'language', 'Which appears first?', ['Coos', 'Laughs', 'Understands "no"', '3–5 words with meaning'], 0, '2 → 4 → 9 → 12 months (course PowerPoint).', S.PPTB),
    g('q4', 'physical', 'Which happens first?', ['Posterior fontanel closes', 'Weight doubles', 'Weight triples', 'Anterior fontanel closes'], 0, '2–3 mo → ~6 mo → 1 y → 12–18 mo.', S.PPTB),
  ] },
  { id: 'concern', title: 'Expected or Concerning?', blurb: 'Decide whether the finding is expected or needs follow-up.', qs: [
    g('c1', 'warning', '6-month-old with a closed anterior fontanel', ['Expected', 'Concerning — report'], 1, 'Lecture 9/30: closes 12–18 months; closed at 6 months → notify provider.', S.L930),
    g('c2', 'warning', '12-month-old who says no words', ['Expected', 'Concerning — report'], 1, 'Red flag → check hearing first (lecture 9/30).', S.L930),
    g('c3', 'nutrition', '2-year-old eating less than last year while growing on the curve', ['Expected', 'Concerning — report'], 0, 'Physiologic anorexia (review #31; textbook Ch31).', S.REV),
    g('c4', 'warning', 'Hospitalized 3-year-old resumes thumb-sucking', ['Expected', 'Concerning — report'], 0, 'Regression under stress is common (textbook Ch31; lecture 9/30).', S.T31),
    g('c5', 'warning', 'Newborn breathing irregularly with a 10-second pause during sleep', ['Expected', 'Concerning — report'], 0, 'Irregular rhythm normal; apnea under 15 s in REM can be normal (ATI).', S.ATI27),
    g('c6', 'warning', '18-month-old who has lost words she used to say', ['Expected', 'Concerning — report'], 1, 'Loss of milestones needs evaluation (review #28; course PowerPoint autism red flag: regression).', S.REV),
    g('c7', 'physical', 'Infant whose head circumference crossed 2 percentile lines in 3 weeks', ['Expected', 'Concerning — report'], 1, 'Crossing ≥1 grid line in 2–4 weeks suggests hydrocephalus (textbook Ch32).', S.T32),
  ] },
  { id: 'teach', title: 'Parent Teaching Challenge', blurb: 'Choose the best teaching for the situation.', qs: [
    g('p1', 'teaching', 'Parent of a 4-month-old asks about honey for a cough.', ['No honey before 1 year (botulism)', 'A teaspoon is fine after 4 months', 'Only raw honey', 'Mix it with formula'], 0, 'Textbook Ch30/31; lecture 9/30.', S.T31),
    g('p2', 'teaching', 'Toddler throws tantrums at bedtime.', ['Every caregiver uses the same consistent rules', 'Spank once to set limits', 'Give in to stop crying', 'Change rules nightly'], 0, 'Lecture 9/30: exam answer = consistency; never hitting.', S.L930),
    g('p3', 'teaching', 'Preschooler needs an IV.', ['Explain right before, briefly, using a doll', 'Explain a week ahead in detail', 'Promise it won’t hurt', 'Say nothing'], 0, 'Review #25; textbook Ch31: prepare close to the time; don’t promise no pain.', S.REV),
    g('p4', 'safety', 'Parent of a 9-month-old who just started crawling.', ['Install gates at the top and bottom of stairs', 'Buy a tricycle', 'Teach swimming strokes', 'Switch to a booster seat'], 0, 'Textbook Ch31 safety table (7–12 months).', S.T31),
    g('p5', 'teaching', 'Teen asks the nurse to keep a secret.', ['Explain confidentiality and its safety limits', 'Promise not to tell anyone', 'Tell parents immediately', 'Change the subject'], 0, 'Review #30.', S.REV),
    g('p6', 'nutrition', 'Toddler drinks 4 bottles of milk daily and refuses solids.', ['Limit milk; it blocks iron and displaces iron-rich foods', 'Add a bedtime bottle', 'Switch to juice', 'Force-feed vegetables'], 0, 'Lecture 10/07; review #31.', S.L107),
  ] },
  { id: 'trap', title: 'Exam Trap Detective', blurb: 'Spot whether the statement is a trap.', qs: [
    g('x1', 'freud', '"Freud’s stages are psychosocial."', ['Trap — Freud is PSYCHOSEXUAL', 'Correct statement'], 0, 'Erikson = psychosocial; Freud = psychosexual. The ATI table mislabels this (D1).', S.ATIM),
    g('x2', 'play', '"A 5-year-old is school-age, so expect rule-based team games."', ['Trap — 5 is still preschool (3–6)', 'Correct statement'], 0, 'Review #26.', S.REV),
    g('x3', 'safety', '"A 1-year-old who weighs 22 lb can face forward."', ['Trap — rear-facing at least to age 2', 'Correct statement'], 0, 'Instructor deck (course PowerPoint Health Promotion).', S.PPTH),
    g('x4', 'warning', '"Quiet breath sounds in an asthma attack mean improvement."', ['Trap — may mean little air is moving', 'Correct statement'], 0, 'Review #2.', S.REV),
    g('x5', 'fine', '"A 9-month-old whose fingers close tightly when the palm is touched shows a normal pincer grasp."', ['Trap — that is the palmar reflex, which should be fading', 'Correct statement'], 0, 'Review #27.', S.REV),
    g('x6', 'physical', '"A premature infant’s milestones are compared to chronological age."', ['Trap — use corrected age', 'Correct statement'], 0, 'Review #27.', S.REV),
  ] },
];

/** 6-step milestone reasoning coach (no answer revealed before submission) */
export const COACH_STEPS = [
  { t: 'Find the age', d: 'Circle the exact age in the stem. Convert months/years and note prematurity (use corrected age).' },
  { t: 'Name the stage', d: 'Infant 0–1, toddler 1–3, preschool 3–6, school-age 6–12, adolescent 12–20 (ATI bands overlap at the edges).' },
  { t: 'Recall the theorists', d: 'Erikson task, Piaget level, Freud stage for that age.' },
  { t: 'Identify the domain', d: 'Is the question about motor, language, cognition, play, nutrition, safety, or teaching?' },
  { t: 'Expected or red flag?', d: 'Compare to the source milestone; loss of a skill is never "normal variation."' },
  { t: 'Pick the safest, age-matched answer', d: 'Match teaching/safety to what the child is about to do next.' },
];
