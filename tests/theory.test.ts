import { describe, expect, it } from 'vitest';
import {
  INTERVALS,
  SIMPLE_INTERVALS,
  formatTones,
  intervalBetween,
  octavesCrossed,
  spelledIntervals,
  tonesLabel,
  transpose,
  type IntervalId,
} from '../src/theory/intervals';
import { isCommonSpelling, noteName, notesFor, type Note } from '../src/theory/notes';

const LETTER = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 } as const;
const ACCIDENTAL = { '': 0, '#': 1, b: -1 } as const;

/** Parses "C", "F#" or "Bb" into a Note. */
function n(name: string): Note {
  const letter = LETTER[name[0] as keyof typeof LETTER];
  const accidental = ACCIDENTAL[name.slice(1) as keyof typeof ACCIDENTAL];
  return { letter, accidental };
}

function interval(id: IntervalId) {
  const found = INTERVALS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Unknown interval ${id}`);
  return found;
}

describe('noteName', () => {
  it('spells letters and solfège with accidentals', () => {
    expect(noteName(n('C'), 'letters')).toBe('C');
    expect(noteName(n('F#'), 'letters')).toBe('F♯');
    expect(noteName(n('Bb'), 'letters')).toBe('B♭');
    expect(noteName(n('G#'), 'solfege')).toBe('Sol♯');
    expect(noteName(n('Bb'), 'solfege')).toBe('Si♭');
  });
});

describe('notesFor', () => {
  it('has 12 notes with sharps only, 12 with flats only, and 17 with both', () => {
    expect(notesFor('sharps')).toHaveLength(12);
    expect(notesFor('flats')).toHaveLength(12);
    expect(notesFor('both')).toHaveLength(17);
  });

  it('leaves out E♯, B♯, F♭ and C♭', () => {
    for (const name of ['E#', 'B#', 'Fb', 'Cb']) expect(isCommonSpelling(n(name))).toBe(false);
  });
});

describe('transpose', () => {
  it.each([
    ['C', 'M3', 'E'],
    ['E', 'M3', 'G#'],
    ['C', 'm3', 'Eb'],
    ['Bb', 'P4', 'Eb'],
    ['F#', 'P5', 'C#'],
    ['A', 'M6', 'F#'],
    ['C', 'A4', 'F#'],
    ['C', 'd5', 'Gb'],
    ['B', 'm2', 'C'],
    ['D', 'm7', 'C'],
    ['Eb', 'M7', 'D'],
    ['Ab', 'm6', 'Fb'],
    ['C', 'M9', 'D'],
    ['B', 'm9', 'C'],
    ['E', 'M10', 'G#'],
    ['A', 'P11', 'D'],
    ['C', 'A11', 'F#'],
    ['C', 'd12', 'Gb'],
    ['Bb', 'P12', 'F'],
    ['C', 'M13', 'A'],
    ['Db', 'm14', 'Cb'],
  ] as const)('%s + %s = %s', (root, id, expected) => {
    expect(transpose(n(root), interval(id))).toEqual(n(expected));
  });

  it('counts octave boundaries for octave numbers', () => {
    expect(octavesCrossed(n('C'), interval('M7'))).toBe(0);
    expect(octavesCrossed(n('B'), interval('m2'))).toBe(1);
    expect(octavesCrossed(n('C'), interval('M9'))).toBe(1);
    expect(octavesCrossed(n('A'), interval('M13'))).toBe(2);
  });

  it('produces double accidentals when the spelling demands it', () => {
    expect(transpose(n('F#'), interval('A4'))).toEqual({ letter: LETTER.B, accidental: 1 });
    expect(transpose(n('Gb'), interval('d5'))).toEqual({ letter: LETTER.D, accidental: -2 });
  });
});

describe('intervalBetween', () => {
  it('tells enharmonic intervals apart', () => {
    expect(intervalBetween(n('C'), n('F#'))?.id).toBe('A4');
    expect(intervalBetween(n('C'), n('Gb'))?.id).toBe('d5');
  });

  it('is the inverse of transpose', () => {
    for (const root of notesFor('both')) {
      for (const candidate of SIMPLE_INTERVALS) {
        expect(intervalBetween(root, transpose(root, candidate))).toBe(candidate);
      }
    }
  });
});

describe('formatTones', () => {
  it.each([
    [1, '½', '½ tone'],
    [2, '1', '1 tone'],
    [3, '1½', '1½ tones'],
    [7, '3½', '3½ tones'],
    [12, '6', '6 tones'],
    [23, '11½', '11½ tones'],
  ])('%i semitones', (semitones, short, long) => {
    expect(formatTones(semitones)).toBe(short);
    expect(tonesLabel(semitones)).toBe(long);
  });
});

describe('INTERVALS', () => {
  it('never includes a unison or an octave', () => {
    for (const { number } of INTERVALS) expect([1, 8, 15]).not.toContain(number);
  });

  it('pairs each compound interval with its simple interval plus 12 semitones', () => {
    for (const compound of INTERVALS.filter((candidate) => candidate.number > 8)) {
      const simple = SIMPLE_INTERVALS.find(
        (candidate) => candidate.number === compound.number - 7 && candidate.id[0] === compound.id[0],
      );
      expect(simple?.semitones).toBe(compound.semitones - 12);
    }
  });
});

describe('spelledIntervals', () => {
  it('only uses notes allowed by the accidental setting', () => {
    for (const setting of ['sharps', 'flats', 'both'] as const) {
      const allowed = notesFor(setting);
      for (const { root, upper } of spelledIntervals(setting)) {
        expect(allowed).toContainEqual(root);
        expect(allowed).toContainEqual(upper);
      }
    }
  });

  it('covers every interval for every accidental setting', () => {
    for (const setting of ['sharps', 'flats', 'both'] as const) {
      const ids = new Set(spelledIntervals(setting).map((pair) => pair.interval.id));
      expect(ids.size).toBe(INTERVALS.length);
    }
  });
});
