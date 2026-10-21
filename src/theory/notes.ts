/** Note spelling: letter names, solfège, and accidentals. */

export type Naming = 'letters' | 'solfege';
export type AccidentalSet = 'sharps' | 'flats' | 'both';

/**
 * A spelled note, independent of octave.
 *
 * `letter` is 0–6 for C D E F G A B. `accidental` is -1 for flat, 0 for
 * natural and 1 for sharp; anything else is a double accidental.
 */
export interface Note {
  readonly letter: number;
  readonly accidental: number;
}

export const LETTER_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const SOLFEGE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;

/** Semitones above C for each natural note. */
export const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const;

export const SHARP = '♯';
export const FLAT = '♭';

const E = 2;
const F = 3;
const B = 6;
const C = 0;

export function noteKey(note: Note): string {
  return `${note.letter}:${note.accidental}`;
}

export function noteName(note: Note, naming: Naming): string {
  const base = naming === 'solfege' ? SOLFEGE_NAMES[note.letter] : LETTER_NAMES[note.letter];
  switch (note.accidental) {
    case 1:
      return base + SHARP;
    case -1:
      return base + FLAT;
    case 0:
      return base;
    default:
      throw new RangeError(`Unsupported accidental: ${note.accidental}`);
  }
}

/**
 * True for the 17 everyday spellings: the naturals, plus every sharp and flat
 * except E♯, B♯, F♭ and C♭. Those four, and double accidentals, are valid
 * theory but out of scope for now.
 */
export function isCommonSpelling(note: Note): boolean {
  switch (note.accidental) {
    case 0:
      return true;
    case 1:
      return note.letter !== E && note.letter !== B;
    case -1:
      return note.letter !== F && note.letter !== C;
    default:
      return false;
  }
}

/** Every common spelling allowed by the accidental setting, in letter order. */
export function notesFor(accidentals: AccidentalSet): Note[] {
  const notes: Note[] = [];
  for (let letter = 0; letter < LETTER_NAMES.length; letter++) {
    for (const accidental of [-1, 0, 1]) {
      if (accidental === 1 && accidentals === 'flats') continue;
      if (accidental === -1 && accidentals === 'sharps') continue;
      const note = { letter, accidental };
      if (isCommonSpelling(note)) notes.push(note);
    }
  }
  return notes;
}
