/** Keys, scales, scale degree names, and the chords built on each degree. */

import { INTERVALS, transpose, type IntervalId } from './intervals';
import { NATURAL_SEMITONES, noteName, type Naming, type Note } from './notes';

export type KeyMode = 'major' | 'minor';

/**
 * Which minor scale minor keys use. Harmonic minor raises the 7th degree, so
 * the dominant is major and the 7th degree is a leading tone. Natural minor
 * keeps it a whole tone below the tonic (the subtonic).
 */
export type MinorForm = 'harmonic' | 'natural';

export interface Key {
  readonly tonic: Note;
  readonly mode: KeyMode;
}

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';

/** The quality of the 7th above the root, not the name of the whole chord. */
export type SeventhQuality = 'major' | 'minor' | 'diminished';

export interface DiatonicChord {
  /** 1 for the tonic up to 7. */
  readonly degree: number;
  readonly root: Note;
  readonly triad: TriadQuality;
  readonly seventh: SeventhQuality;
}

const SCALE_STEPS: Record<KeyMode | 'harmonicMinor', IntervalId[]> = {
  major: ['M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
  minor: ['M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
  harmonicMinor: ['M2', 'm3', 'P4', 'P5', 'm6', 'M7'],
};

const DEGREE_NAMES = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant'] as const;

export const DEGREES = [1, 2, 3, 4, 5, 6, 7] as const;

function intervalById(id: IntervalId) {
  const interval = INTERVALS.find((candidate) => candidate.id === id);
  if (!interval) throw new Error(`Unknown interval ${id}`);
  return interval;
}

/** Semitones above C, from 0 to 11. */
function pitchClass(note: Note): number {
  return (((NATURAL_SEMITONES[note.letter] + note.accidental) % 12) + 12) % 12;
}

/** Semitones from `lower` up to `upper`, from 0 to 11. */
function semitonesUp(lower: Note, upper: Note): number {
  return (pitchClass(upper) - pitchClass(lower) + 12) % 12;
}

/** The seven notes of the key's scale, tonic first. */
export function scaleOf(key: Key, minorForm: MinorForm): Note[] {
  const steps = SCALE_STEPS[key.mode === 'minor' && minorForm === 'harmonic' ? 'harmonicMinor' : key.mode];
  return [key.tonic, ...steps.map((id) => transpose(key.tonic, intervalById(id)))];
}

/**
 * True when every note of the scale needs at most one sharp or flat. This
 * rules out theoretical keys such as D♯ major, which needs F double-sharp.
 */
export function isPracticalScale(scale: readonly Note[]): boolean {
  return scale.every((note) => Math.abs(note.accidental) <= 1);
}

/**
 * The traditional name of a scale degree. The 7th degree is the leading tone
 * when it sits a semitone below the tonic, and the subtonic when it's a whole
 * tone below.
 */
export function degreeName(degree: number, scale: readonly Note[]): string {
  if (degree === 7) return semitonesUp(scale[6], scale[0]) === 1 ? 'Leading tone' : 'Subtonic';
  return DEGREE_NAMES[degree - 1];
}

const TRIADS: Record<string, TriadQuality> = {
  '4,7': 'major',
  '3,7': 'minor',
  '3,6': 'diminished',
  '4,8': 'augmented',
};

const SEVENTHS: Record<number, SeventhQuality> = { 11: 'major', 10: 'minor', 9: 'diminished' };

/** The chord built in 3rds from a degree of the scale, using only notes of that scale. */
export function diatonicChord(scale: readonly Note[], degree: number): DiatonicChord {
  const tone = (offset: number) => scale[(degree - 1 + offset) % 7];
  const root = tone(0);
  const triad = TRIADS[`${semitonesUp(root, tone(2))},${semitonesUp(root, tone(4))}`];
  const seventh = SEVENTHS[semitonesUp(root, tone(6))];
  if (!triad || !seventh) throw new Error(`Unexpected chord on degree ${degree}`);
  return { degree, root, triad, seventh };
}

const TRIAD_SYMBOLS: Record<TriadQuality, string> = { major: '', minor: 'm', diminished: '°', augmented: '+' };

const SEVENTH_SYMBOLS: Record<string, string> = {
  'major,major': 'maj7',
  'major,minor': '7',
  'minor,minor': 'm7',
  'minor,major': 'm(maj7)',
  'diminished,minor': 'ø7',
  'diminished,diminished': '°7',
  'augmented,major': '+maj7',
};

/** A chord symbol such as "A", "Bm", "G♯°", "A7", or "Bø7". */
export function chordSymbol(chord: DiatonicChord, naming: Naming, withSeventh: boolean): string {
  const suffix = withSeventh ? SEVENTH_SYMBOLS[`${chord.triad},${chord.seventh}`] : TRIAD_SYMBOLS[chord.triad];
  return noteName(chord.root, naming) + suffix;
}

export function keyName(key: Key, naming: Naming): string {
  return `${noteName(key.tonic, naming)} ${key.mode}`;
}
