// Core data model for PEDS HESI 2026 | Clinical Judgment Simulator

export type CategoryId =
  | 'resp' | 'cardio' | 'endo' | 'gigu' | 'growth' | 'msk'
  | 'neuro' | 'heme' | 'skin' | 'eent' | 'meds';

/** NCSBN Clinical Judgment Measurement Model cognitive operations */
export type CJ =
  | 'recognize' | 'analyze' | 'prioritize' | 'generate' | 'act' | 'evaluate';

/** 1 recall · 2 application · 3 analysis/prioritization · 4 complex judgment */
export type Difficulty = 1 | 2 | 3 | 4;

export type ScoringRule =
  | 'dichotomous'   // 0/1 for the whole item
  | 'plusminus'     // +1 each correct choice, −1 each wrong choice, floor 0
  | 'perElement';   // 0/1 for each row / blank / slot / bow-tie element

export interface Rationale {
  /** why the keyed answer is right */
  correct: string;
  /** one note per option / row (aligned by index). Key options may be '' */
  options?: string[];
  priority: string;
  clue: string;
  memory?: string;
  /** plain-language explanation for the WHY? button */
  simple?: string;
  /** why the most tempting wrong option(s) attract students (coach, after submission) */
  tempt?: string;
  /** a small change to the scenario that would change the keyed answer (coach, after submission) */
  variation?: string;
  /** the underlying physiology in one or two sentences (coach, after submission) */
  physiology?: string;
}

interface Base {
  id: string;
  topics: number[];
  cj: CJ;
  diff: Difficulty;
  age?: string;
  stem: string;
  rationale: Rationale;
  /** where the content came from. "Instructor HESI Review #n" = the 69-topic review */
  src: string[];
  /** external references supporting the clinical content */
  refs?: string[];
  qa: 'reviewed' | 'flagged';
  /** set for items that belong to an unfolding case */
  caseId?: string;
  stage?: number;
  /** for standalone NGN items that need their own mini-chart */
  exhibit?: Exhibit;
  /** mark whether the item counts as NGN for reporting */
  ngn?: boolean;
}

export interface MCItem extends Base { fmt: 'mc'; options: string[]; answer: number; }
export interface SATAItem extends Base {
  fmt: 'sata'; options: string[]; answer: number[];
  /** 'dichotomous' for traditional HESI SATA, 'plusminus' for NGN extended MR */
  scoring: 'dichotomous' | 'plusminus';
}
export interface OrderItem extends Base { fmt: 'order'; options: string[]; /** correct order as option indexes */ answer: number[]; }
export interface NumericItem extends Base { fmt: 'numeric'; unit: string; answer: number; tolerance: number; decimals: number; steps: string[]; }
export interface MatrixItem extends Base {
  fmt: 'matrix'; columns: string[]; rows: string[];
  /** single choice per row: column index per row */
  answer: number[];
}
export interface ClozeItem extends Base {
  fmt: 'cloze';
  /** text with {0}, {1} placeholders */
  template: string;
  blanks: { options: string[]; answer: number }[];
}
export interface BowtieItem extends Base {
  fmt: 'bowtie';
  conditions: string[]; condition: number;
  actions: string[]; actionAnswer: [number, number];
  params: string[]; paramAnswer: [number, number];
}
export interface HighlightItem extends Base {
  fmt: 'highlight';
  /** passage split into selectable segments; plain text in between allowed with key=null */
  segments: { text: string; key: boolean | null }[];
}
export interface DragItem extends Base {
  fmt: 'drag';
  /** sentence/table slots each filled from the token pool */
  slots: string[];
  pool: string[];
  /** pool index per slot */
  answer: number[];
}

export type Item = MCItem | SATAItem | OrderItem | NumericItem | MatrixItem | ClozeItem | BowtieItem | HighlightItem | DragItem;
export type Fmt = Item['fmt'];

export interface ChartRow { cells: string[]; }
export interface ChartTable { title?: string; head: string[]; rows: string[][]; }
export interface ChartEntry {
  /** first stage at which this entry is visible (1-6) */
  stage: number;
  tab: 'profile' | 'history' | 'notes' | 'vitals' | 'labs' | 'diagnostics' | 'orders' | 'mar' | 'io' | 'progress';
  time?: string;
  text?: string;
  table?: ChartTable;
}
export interface Exhibit { title: string; entries: ChartEntry[]; }

export interface CaseStudy {
  id: string;
  title: string;
  patient: string;
  topics: number[];
  cat: CategoryId;
  diff: Difficulty;
  /** short scene-setting line shown at each stage */
  stageNotes: string[];
  chart: ChartEntry[];
  items: Item[]; // exactly 6, stage 1..6
}

export interface Topic {
  n: number;
  /** 'instructor' = the 69-topic review (default); 'ati' = supplemental topic added from the uploaded ATI chapter file */
  origin?: 'instructor' | 'ati';
  cat: CategoryId;
  title: string;
  findings: string[];
  priorities: string[];
  teaching: string[];
  complications: string[];
  traps: string[];
  meds: string[];
  /** points added from course materials outside the HESI review */
  supplemental: { text: string; src: string }[];
  mnemonic?: string;
}

/* ---------- runtime state ---------- */
export type Response =
  | { kind: 'mc'; choice: number | null }
  | { kind: 'sata'; choices: number[] }
  | { kind: 'order'; order: number[] }
  | { kind: 'numeric'; value: string }
  | { kind: 'matrix'; rows: (number | null)[] }
  | { kind: 'cloze'; blanks: (number | null)[] }
  | { kind: 'bowtie'; condition: number | null; actions: number[]; params: number[] }
  | { kind: 'highlight'; selected: number[] }
  | { kind: 'drag'; slots: (number | null)[] };

export interface Score { earned: number; possible: number; rule: ScoringRule; full: boolean; }

export interface ExamSlot {
  itemId: string;
  scored: boolean; // false = simulated unscored/pilot item
}

export type ExamKind = 'hesi' | 'extended' | 'formA' | 'formB' | 'tutor' | 'case' | 'missed' | 'adaptive' | 'priority' | 'dosage' | 'ladder' | 'quick';

/** confidence rating 1 (guessing) … 5 (certain). Version-1 data used 'low' | 'med' | 'high'. */
export type Conf = 1 | 2 | 3 | 4 | 5;

export type MistakeType =
  | 'content' | 'misread' | 'priorityWord' | 'confused' | 'medMech'
  | 'numeric' | 'sataIncomplete' | 'changed' | 'prioritizing';

export interface ExamSettings {
  navigation: 'linear' | 'free';
  minutes: number;
  unscoredItems: boolean;
  confidence: boolean;
}

export interface ActiveExam {
  id: string;
  kind: ExamKind;
  title: string;
  slots: ExamSlot[];
  responses: Record<string, Response>;
  confidence: Record<string, Conf>;
  /** how many times an existing answer was changed, per item */
  changes?: Record<string, number>;
  /** the first complete answer given for each item (detects right → wrong changes) */
  initial?: Record<string, Response>;
  /** options the student crossed out (coach elimination), per item */
  eliminated?: Record<string, number[]>;
  /** items on which the reasoning coach was opened before answering */
  coached?: string[];
  /** set when the Rapid Review reference was opened during this session */
  refOpened?: boolean;
  /** quick-mode tag, e.g. 'q5' | 'q10' | 'q20' | 'rescue' | 'night' */
  mode?: string;
  /** adaptive difficulty ladder state (kind 'ladder') */
  ladder?: { level: number; streak: number; target: number; history: number[] };
  flags: string[];
  timeSpent: Record<string, number>;
  index: number;
  /** ms remaining; null for untimed */
  remainingMs: number | null;
  startedAt: number;
  settings: ExamSettings;
  tutor: boolean;
  /** ids whose answers were checked in tutor mode */
  checked: string[];
  /** generated items (dosage lab) embedded in the exam */
  generated?: Item[];
}

export interface AttemptItem {
  id: string; earned: number; possible: number; full: boolean; scored: boolean;
  ms: number; conf?: Conf; response?: Response;
  /** answer changed at least once before submission */
  changed?: number;
  /** coach opened before answering */
  coached?: boolean;
  /** first-ever exposure to this item (set when progress is applied) */
  first?: boolean;
  /** the first answer given would have scored full credit (only recorded when it differs from the final answer) */
  initialFull?: boolean;
  /** item is NOT VERIFIED in the uploaded sources: practice only, never scored */
  unverified?: boolean;
}
export interface Attempt {
  id: string; kind: ExamKind; title: string; finishedAt: number; startedAt: number;
  items: AttemptItem[]; expired: boolean; generated?: Item[];
  /** reference material was opened during the session (excluded from readiness) */
  refUsed?: boolean;
  mode?: string;
  /** item order changed mid-session (ladder) — informational only */
  ladderLevels?: number[];
}

export interface ItemStat {
  seen: number; correct: number; lastFull: boolean; lastSeen: number; avgMs: number; wrongHighConf: number;
  /** result of the very first attempt (first-attempt accuracy); undefined for data that predates tracking */
  firstFull?: boolean;
  firstAt?: number;
}

export interface MistakeTag { type: MistakeType; at: number; /** true when suggested automatically and not yet confirmed */ auto?: boolean }

export interface RapidStats {
  /** mini-game results keyed by game id */
  games: Record<string, { n: number; correct: number; last: number }>;
  /** flashcard spaced repetition keyed by card id */
  cards: Record<string, { due: number; step: number; right: number; wrong: number }>;
}

export interface Store {
  version: number;
  updatedAt: number;
  settings: ExamSettings & { examDate: string; weights: Partial<Record<CategoryId, number>> };
  itemStats: Record<string, ItemStat>;
  /** item ids missed or partially correct and not yet re-mastered */
  missed: Record<string, { at: number; topics: number[]; retried: number; masteredBy?: string }>;
  attempts: Attempt[];
  active: ActiveExam | null;
  /** spaced repetition schedule for rapid review: itemId -> due epoch ms */
  srs: Record<string, { due: number; step: number }>;
  formRotation: { lastForm: 'A' | 'B' | null; served: Record<string, number> };
  /** mistake classification per item (latest) */
  mistakes: Record<string, MistakeTag>;
  rapid: RapidStats;
  /** when this store was upgraded to version 2; attempts finished before it are "historical" */
  upgradedAt: number;
}
