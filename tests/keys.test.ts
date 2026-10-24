import { describe, expect, it } from 'vitest';
import {
  chordSymbol,
  degreeName,
  diatonicChord,
  isPracticalScale,
  keyName,
  scaleOf,
  type Key,
  type MinorForm,
} from '../src/theory/keys';
import { noteName, type Note } from '../src/theory/notes';

const LETTER = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 } as const;
const ACCIDENTAL = { '': 0, '#': 1, b: -1 } as const;

function n(name: string): Note {
  return {
    letter: LETTER[name[0] as keyof typeof LETTER],
    accidental: ACCIDENTAL[name.slice(1) as keyof typeof ACCIDENTAL],
  };
}

function key(name: string, mode: Key['mode']): Key {
  return { tonic: n(name), mode };
}

/** Every chord of a key as symbols, such as ["C", "Dm", "Em", ...]. */
function chords(k: Key, minorForm: MinorForm, withSeventh: boolean): string[] {
  const scale = scaleOf(k, minorForm);
  return [1, 2, 3, 4, 5, 6, 7].map((degree) => chordSymbol(diatonicChord(scale, degree), 'letters', withSeventh));
}

describe('scaleOf', () => {
  it('spells major, natural minor, and harmonic minor scales', () => {
    const names = (k: Key, form: MinorForm) => scaleOf(k, form).map((note) => noteName(note, 'letters')).join(' ');
    expect(names(key('D', 'major'), 'harmonic')).toBe('D E F♯ G A B C♯');
    expect(names(key('Bb', 'major'), 'harmonic')).toBe('B♭ C D E♭ F G A');
    expect(names(key('A', 'minor'), 'natural')).toBe('A B C D E F G');
    expect(names(key('A', 'minor'), 'harmonic')).toBe('A B C D E F G♯');
  });

  it('rejects theoretical keys that need double sharps or flats', () => {
    expect(isPracticalScale(scaleOf(key('C#', 'major'), 'harmonic'))).toBe(true);
    expect(isPracticalScale(scaleOf(key('D#', 'major'), 'harmonic'))).toBe(false);
    expect(isPracticalScale(scaleOf(key('A#', 'minor'), 'natural'))).toBe(true);
    expect(isPracticalScale(scaleOf(key('A#', 'minor'), 'harmonic'))).toBe(false);
  });
});

describe('diatonicChord', () => {
  it('builds the triads of a major key', () => {
    expect(chords(key('C', 'major'), 'harmonic', false)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
    expect(chords(key('D', 'major'), 'harmonic', false)).toEqual(['D', 'Em', 'F♯m', 'G', 'A', 'Bm', 'C♯°']);
  });

  it('builds the triads of harmonic and natural minor keys', () => {
    expect(chords(key('A', 'minor'), 'harmonic', false)).toEqual(['Am', 'B°', 'C+', 'Dm', 'E', 'F', 'G♯°']);
    expect(chords(key('A', 'minor'), 'natural', false)).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G']);
  });

  it('builds seventh chords', () => {
    expect(chords(key('C', 'major'), 'harmonic', true)).toEqual([
      'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bø7',
    ]);
    expect(chords(key('A', 'minor'), 'harmonic', true)).toEqual([
      'Am(maj7)', 'Bø7', 'C+maj7', 'Dm7', 'E7', 'Fmaj7', 'G♯°7',
    ]);
    expect(chords(key('A', 'minor'), 'natural', true)).toEqual(['Am7', 'Bø7', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7']);
  });

  it('gives the seventh quality separately from the triad', () => {
    const scale = scaleOf(key('D', 'major'), 'harmonic');
    expect(diatonicChord(scale, 5)).toMatchObject({ root: n('A'), triad: 'major', seventh: 'minor' });
    expect(diatonicChord(scale, 7)).toMatchObject({ root: n('C#'), triad: 'diminished', seventh: 'minor' });
  });
});

describe('degreeName', () => {
  it('names the degrees, with leading tone or subtonic for the 7th', () => {
    const major = scaleOf(key('G', 'major'), 'harmonic');
    expect([1, 2, 3, 4, 5, 6, 7].map((degree) => degreeName(degree, major))).toEqual([
      'Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading tone',
    ]);
    expect(degreeName(7, scaleOf(key('E', 'minor'), 'harmonic'))).toBe('Leading tone');
    expect(degreeName(7, scaleOf(key('E', 'minor'), 'natural'))).toBe('Subtonic');
  });
});

describe('keyName', () => {
  it('names keys in letters or solfège', () => {
    expect(keyName(key('F#', 'minor'), 'letters')).toBe('F♯ minor');
    expect(keyName(key('Bb', 'major'), 'solfege')).toBe('Si♭ major');
  });
});
