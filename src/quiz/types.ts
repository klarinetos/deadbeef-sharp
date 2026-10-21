import type { IntervalId, SimpleIntervalId } from '../theory/intervals';
import type { AccidentalSet, Naming } from '../theory/notes';

export type ModeId = 'findNote' | 'nameInterval' | 'notesToTones' | 'intervalToTones';

/** How the next question type is chosen. */
export type Order = 'roundRobin' | 'uniform' | 'weighted';

export type QuestionCount = 5 | 10 | 20 | 50 | 'infinite';

/** 'both' picks letters or solfège at random for each question. */
export type NamingSetting = Naming | 'both';

/** 'random' makes each question use only sharps or only flats, chosen at random. */
export type AccidentalSetting = AccidentalSet | 'random';

/** Options for question types that ask about specific intervals. */
export interface IntervalOptions {
  intervals: SimpleIntervalId[];
}

/** How far up tone questions can reach. The octave itself is never asked. */
export type ToneRange = 'octave' | 'thirteenth' | 'twoOctaves';

/** Which interval numbers tone questions use: odd means 3rds, 5ths, 7ths and so on. */
export type NumberFilter = 'all' | 'odd' | 'even';

/** Options for question types answered in tones. */
export interface ToneOptions {
  range: ToneRange;
  numbers: NumberFilter;
}

export interface ModeOptions {
  findNote: IntervalOptions;
  nameInterval: IntervalOptions;
  notesToTones: ToneOptions;
  intervalToTones: ToneOptions;
}

export interface Settings {
  modes: ModeId[];
  order: Order;
  /** Relative odds for each question type, used when order is 'weighted'. */
  weights: Record<ModeId, number>;
  count: QuestionCount;
  naming: NamingSetting;
  accidentals: AccidentalSetting;
  modeOptions: ModeOptions;
}

/** Returns a number in [0, 1), like Math.random. */
export type Rng = () => number;

export type AnswerType = 'note' | 'interval' | 'tones';

export interface Choice {
  key: string;
  label: string;
  detail?: string;
  /** How the answer reads on its own, for feedback and results. Defaults to label. */
  longLabel?: string;
  /** Grid placement for note buttons: one column per letter, one row per accidental. */
  row?: number;
  column?: number;
}

export interface Question {
  modeId: ModeId;
  intervalId: IntervalId;
  /** Identifies the question so the same one isn't asked twice in a row. */
  signature: string;
  title: string;
  prompt: string;
  hint: string;
  /** The question as a single line, for the results screen. */
  text: string;
  answerType: AnswerType;
  choices: Choice[];
  answerKey: string;
  answerLabel: string;
}

export interface AnswerRecord {
  modeId: ModeId;
  text: string;
  given: string;
  answer: string;
  correct: boolean;
}
