import { INTERVALS, SIMPLE_INTERVALS, type Interval } from '../theory/intervals';
import { DEGREES, type MinorForm } from '../theory/keys';
import type {
  IntervalOptions,
  KeySetting,
  ModeId,
  ModeOptions,
  NumberFilter,
  ToneOptions,
  ToneRange,
} from './types';

export const TONE_RANGES: readonly ToneRange[] = ['octave', 'thirteenth', 'twoOctaves'];
export const NUMBER_FILTERS: readonly NumberFilter[] = ['all', 'odd', 'even'];
export const KEY_SETTINGS: readonly KeySetting[] = ['major', 'minor', 'both'];
export const MINOR_FORMS: readonly MinorForm[] = ['harmonic', 'natural'];

/** Degree names for option lists. The 7th depends on the minor form, so it gets both names. */
export const DEGREE_LABELS: Record<number, string> = {
  1: 'Tonic',
  2: 'Supertonic',
  3: 'Mediant',
  4: 'Subdominant',
  5: 'Dominant',
  6: 'Submediant',
  7: 'Leading tone / subtonic',
};

/** The largest interval number each range reaches. */
const RANGE_MAX_NUMBER: Record<ToneRange, number> = { octave: 7, thirteenth: 13, twoOctaves: 14 };

export const RANGE_LABELS: Record<ToneRange, string> = {
  octave: 'Within an octave',
  thirteenth: 'Up to a 13th',
  twoOctaves: 'Within two octaves',
};

export const NUMBER_LABELS: Record<NumberFilter, string> = {
  all: 'All numbers',
  odd: 'Odd only',
  even: 'Even only',
};

export const DEFAULT_MODE_OPTIONS: ModeOptions = {
  findNote: { intervals: SIMPLE_INTERVALS.map((interval) => interval.id) },
  nameInterval: { intervals: SIMPLE_INTERVALS.map((interval) => interval.id) },
  notesToTones: { range: 'octave', numbers: 'all' },
  intervalToTones: { range: 'octave', numbers: 'all' },
  degreeToChord: { keys: 'major', minorForm: 'harmonic', sevenths: false, degrees: [...DEGREES] },
};

export function isIntervalMode(id: ModeId): id is 'findNote' | 'nameInterval' {
  return id === 'findNote' || id === 'nameInterval';
}

/** The intervals selected for an interval question type, smallest first. */
export function selectedIntervals(options: IntervalOptions): Interval[] {
  return SIMPLE_INTERVALS.filter((interval) => options.intervals.includes(interval.id));
}

/** The intervals a tone question type can ask about, smallest first. */
export function toneIntervals(options: ToneOptions): Interval[] {
  return INTERVALS.filter(
    (interval) =>
      interval.number <= RANGE_MAX_NUMBER[options.range] &&
      (options.numbers === 'all' || interval.number % 2 === (options.numbers === 'odd' ? 1 : 0)),
  );
}

/** "3rds", "11ths", for listing which interval numbers are included. */
export function pluralOrdinal(number: number): string {
  if (number === 2) return '2nds';
  if (number === 3) return '3rds';
  return `${number}ths`;
}

/** A one-line description of a question type's current options, for its settings card. */
export function modeSummary(id: ModeId, options: ModeOptions): string {
  if (isIntervalMode(id)) {
    const intervals = selectedIntervals(options[id]);
    if (intervals.length === SIMPLE_INTERVALS.length) return `All ${intervals.length} intervals`;
    if (intervals.length <= 4) return intervals.map((interval) => interval.id).join(', ');
    return `${intervals.length} intervals`;
  }
  if (id === 'degreeToChord') {
    const { keys, minorForm, sevenths, degrees } = options.degreeToChord;
    const minor = `${minorForm} minor`;
    const keyText = keys === 'major' ? 'Major keys' : keys === 'minor' ? `${minor} keys` : `Major and ${minor} keys`;
    const parts = [keyText.charAt(0).toUpperCase() + keyText.slice(1), sevenths ? 'with 7ths' : 'triads'];
    if (degrees.length < DEGREES.length) parts.push(`${degrees.length} of 7 degrees`);
    return parts.join(', ');
  }
  const { range, numbers } = options[id];
  return numbers === 'all' ? RANGE_LABELS[range] : `${RANGE_LABELS[range]}, ${NUMBER_LABELS[numbers].toLowerCase()}`;
}
