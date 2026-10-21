/** Intervals: spelling the note above a root, naming the gap between two notes, and tone counts. */

import { NATURAL_SEMITONES, noteKey, notesFor, type AccidentalSet, type Note } from './notes';

export type SimpleIntervalId =
  | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'A4'
  | 'd5' | 'P5' | 'm6' | 'M6' | 'm7' | 'M7';

export type CompoundIntervalId =
  | 'm9' | 'M9' | 'm10' | 'M10' | 'P11' | 'A11'
  | 'd12' | 'P12' | 'm13' | 'M13' | 'm14' | 'M14';

export type IntervalId = SimpleIntervalId | CompoundIntervalId;

export interface Interval {
  readonly id: IntervalId;
  readonly name: string;
  /** The interval number: 3 for a 3rd, 10 for a 10th. */
  readonly number: number;
  readonly semitones: number;
}

/**
 * Every interval the trainer asks about, smallest first. Unisons and octaves
 * are left out on purpose: they're too trivial to drill.
 */
export const INTERVALS: readonly Interval[] = [
  { id: 'm2', name: 'Minor 2nd', number: 2, semitones: 1 },
  { id: 'M2', name: 'Major 2nd', number: 2, semitones: 2 },
  { id: 'm3', name: 'Minor 3rd', number: 3, semitones: 3 },
  { id: 'M3', name: 'Major 3rd', number: 3, semitones: 4 },
  { id: 'P4', name: 'Perfect 4th', number: 4, semitones: 5 },
  { id: 'A4', name: 'Augmented 4th', number: 4, semitones: 6 },
  { id: 'd5', name: 'Diminished 5th', number: 5, semitones: 6 },
  { id: 'P5', name: 'Perfect 5th', number: 5, semitones: 7 },
  { id: 'm6', name: 'Minor 6th', number: 6, semitones: 8 },
  { id: 'M6', name: 'Major 6th', number: 6, semitones: 9 },
  { id: 'm7', name: 'Minor 7th', number: 7, semitones: 10 },
  { id: 'M7', name: 'Major 7th', number: 7, semitones: 11 },
  { id: 'm9', name: 'Minor 9th', number: 9, semitones: 13 },
  { id: 'M9', name: 'Major 9th', number: 9, semitones: 14 },
  { id: 'm10', name: 'Minor 10th', number: 10, semitones: 15 },
  { id: 'M10', name: 'Major 10th', number: 10, semitones: 16 },
  { id: 'P11', name: 'Perfect 11th', number: 11, semitones: 17 },
  { id: 'A11', name: 'Augmented 11th', number: 11, semitones: 18 },
  { id: 'd12', name: 'Diminished 12th', number: 12, semitones: 18 },
  { id: 'P12', name: 'Perfect 12th', number: 12, semitones: 19 },
  { id: 'm13', name: 'Minor 13th', number: 13, semitones: 20 },
  { id: 'M13', name: 'Major 13th', number: 13, semitones: 21 },
  { id: 'm14', name: 'Minor 14th', number: 14, semitones: 22 },
  { id: 'M14', name: 'Major 14th', number: 14, semitones: 23 },
];

export interface SimpleInterval extends Interval {
  readonly id: SimpleIntervalId;
}

export function isSimple(interval: Interval): interval is SimpleInterval {
  return interval.number < 8;
}

/** Intervals smaller than an octave. */
export const SIMPLE_INTERVALS: readonly SimpleInterval[] = INTERVALS.filter(isSimple);

/** How many octave boundaries (from C up) the interval crosses above `root`. */
export function octavesCrossed(root: Note, interval: Interval): number {
  return Math.floor((root.letter + interval.number - 1) / 7);
}

/**
 * The correctly spelled note an interval above `root`.
 *
 * The letter comes from the interval number and the accidental makes up the
 * semitone difference, so a major 3rd above E is G♯, never A♭. The result
 * may be a double accidental or an uncommon spelling such as E♯.
 */
export function transpose(root: Note, interval: Interval): Note {
  const letter = (root.letter + interval.number - 1) % 7;
  const naturalGap =
    NATURAL_SEMITONES[letter] - NATURAL_SEMITONES[root.letter] + 12 * octavesCrossed(root, interval);
  return { letter, accidental: root.accidental + interval.semitones - naturalGap };
}

/** The interval from `lower` up to `upper` within an octave, if it is one we know. */
export function intervalBetween(lower: Note, upper: Note): Interval | undefined {
  const target = noteKey(upper);
  return SIMPLE_INTERVALS.find((interval) => noteKey(transpose(lower, interval)) === target);
}

/** Formats a semitone count as tones: 1 → "½", 2 → "1", 7 → "3½". */
export function formatTones(semitones: number): string {
  if (semitones === 0) return '0';
  const whole = Math.floor(semitones / 2);
  const half = semitones % 2 === 1 ? '½' : '';
  return whole === 0 ? half : `${whole}${half}`;
}

/** Like formatTones, with the unit: "½ tone", "1 tone", "1½ tones". */
export function tonesLabel(semitones: number): string {
  return `${formatTones(semitones)} ${semitones <= 2 ? 'tone' : 'tones'}`;
}

export interface SpelledInterval {
  readonly root: Note;
  readonly interval: Interval;
  readonly upper: Note;
}

const pairCache = new Map<AccidentalSet, readonly SpelledInterval[]>();

/**
 * Every root and interval whose two notes both use common spellings allowed
 * by the accidental setting. With sharps only, for example, a minor 3rd above
 * C is left out because the answer is E♭.
 */
export function spelledIntervals(accidentals: AccidentalSet): readonly SpelledInterval[] {
  let pairs = pairCache.get(accidentals);
  if (!pairs) {
    const notes = notesFor(accidentals);
    const allowed = new Set(notes.map(noteKey));
    pairs = notes.flatMap((root) =>
      INTERVALS.map((interval) => ({ root, interval, upper: transpose(root, interval) })).filter(
        ({ upper }) => allowed.has(noteKey(upper)),
      ),
    );
    pairCache.set(accidentals, pairs);
  }
  return pairs;
}
