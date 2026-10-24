import {
  formatTones,
  octavesCrossed,
  spelledIntervals,
  tonesLabel,
  type Interval,
  type SpelledInterval,
} from '../theory/intervals';
import {
  chordSymbol,
  degreeName,
  diatonicChord,
  isPracticalScale,
  keyName,
  scaleOf,
  type DiatonicChord,
  type Key,
  type KeyMode,
  type SeventhQuality,
  type TriadQuality,
} from '../theory/keys';
import { noteKey, noteName, notesFor, type AccidentalSet, type Naming } from '../theory/notes';
import { selectedIntervals, toneIntervals } from './modeOptions';
import type { AnswerPart, Choice, ChoiceLayout, ChordOptions, ModeId, Question, Rng, Settings } from './types';

/** The octave number shown for the lower note when notes need octave numbers, as in C4 → E5. */
const ROOT_OCTAVE = 4;

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

function singlePart(layout: ChoiceLayout, choices: Choice[], answerKey: string): AnswerPart[] {
  return [{ id: 'answer', label: 'Answer', layout, choices, answerKey }];
}

function pickSpelledInterval(
  accidentals: AccidentalSet,
  intervals: readonly Interval[],
  rng: Rng,
): SpelledInterval {
  const allowed = new Set(intervals.map((interval) => interval.id));
  return pick(
    spelledIntervals(accidentals).filter((pair) => allowed.has(pair.interval.id)),
    rng,
  );
}

/** Note buttons laid out with one column per letter and one row per accidental, sharps on top. */
export function noteChoices(accidentals: AccidentalSet, naming: Naming): Choice[] {
  const rowOrder = [1, 0, -1].filter(
    (accidental) =>
      !(accidental === 1 && accidentals === 'flats') && !(accidental === -1 && accidentals === 'sharps'),
  );
  return notesFor(accidentals).map((note) => ({
    key: noteKey(note),
    label: noteName(note, naming),
    row: rowOrder.indexOf(note.accidental) + 1,
    column: note.letter + 1,
  }));
}

export function intervalChoices(intervals: readonly Interval[]): Choice[] {
  return intervals.map((interval) => ({
    key: interval.id,
    label: interval.id,
    detail: interval.name,
    longLabel: `${interval.id} (${interval.name})`,
  }));
}

/** Half a tone up to the largest interval in play. */
export function toneChoices(intervals: readonly Interval[]): Choice[] {
  const largest = Math.max(...intervals.map((interval) => interval.semitones));
  return Array.from({ length: largest }, (_, i) => {
    const semitones = i + 1;
    return { key: String(semitones), label: formatTones(semitones), longLabel: tonesLabel(semitones) };
  });
}

const TRIAD_CHOICES: Choice[] = (['major', 'minor', 'diminished', 'augmented'] as TriadQuality[]).map((quality) => ({
  key: quality,
  label: quality.charAt(0).toUpperCase() + quality.slice(1),
  longLabel: quality,
}));

const SEVENTH_CHOICES: Choice[] = (['major', 'minor', 'diminished'] as SeventhQuality[]).map((quality) => ({
  key: quality,
  label: `${quality.charAt(0).toUpperCase() + quality.slice(1)} 7th`,
  longLabel: `${quality} 7th`,
}));

interface KeyedChord {
  key: Key;
  scale: ReturnType<typeof scaleOf>;
  chord: DiatonicChord;
}

/**
 * Every key and degree the chord options allow, where the key's tonic and the
 * chord's root are both spellings the accidental setting allows.
 */
function chordPool(options: ChordOptions, accidentals: AccidentalSet): KeyedChord[] {
  const allowed = new Set(notesFor(accidentals).map(noteKey));
  const modes: KeyMode[] = options.keys === 'both' ? ['major', 'minor'] : [options.keys];
  return notesFor(accidentals).flatMap((tonic) =>
    modes.flatMap((mode) => {
      const key = { tonic, mode };
      const scale = scaleOf(key, options.minorForm);
      if (!isPracticalScale(scale)) return [];
      return options.degrees
        .map((degree) => ({ key, scale, chord: diatonicChord(scale, degree) }))
        .filter(({ chord }) => allowed.has(noteKey(chord.root)));
    }),
  );
}

function degreeToChordQuestion(options: ChordOptions, accidentals: AccidentalSet, naming: Naming, rng: Rng): Question {
  const { key, scale, chord } = pick(chordPool(options, accidentals), rng);
  const degree = degreeName(chord.degree, scale);
  const keyText = keyName(key, naming);
  const chordKind = options.sevenths ? 'seventh chord' : 'triad';
  const answerWords = [noteName(chord.root, naming), chord.triad];
  if (options.sevenths) answerWords.push(`${chord.seventh} 7th`);

  const parts: AnswerPart[] = [
    {
      id: 'root',
      label: 'Root',
      layout: 'note',
      choices: noteChoices(accidentals, naming),
      answerKey: noteKey(chord.root),
    },
    { id: 'triad', label: 'Quality', layout: 'list', choices: TRIAD_CHOICES, answerKey: chord.triad },
  ];
  if (options.sevenths) {
    parts.push({ id: 'seventh', label: 'Seventh', layout: 'list', choices: SEVENTH_CHOICES, answerKey: chord.seventh });
  }

  return {
    modeId: 'degreeToChord',
    signature: `degreeToChord:${noteKey(key.tonic)}:${key.mode}:${chord.degree}`,
    title: 'Name the chord',
    prompt: `${degree} of ${keyText}`,
    hint: `Name the ${degree.toLowerCase()} ${chordKind} in ${keyText}.`,
    text: `${degree} ${chordKind} of ${keyText}`,
    parts,
    answerLabel: `${answerWords.join(', ')} (${chordSymbol(chord, naming, options.sevenths)})`,
  };
}

export function makeQuestion(modeId: ModeId, settings: Settings, rng: Rng): Question {
  const naming: Naming = settings.naming === 'both' ? pick(['letters', 'solfege'], rng) : settings.naming;
  const accidentals: AccidentalSet =
    settings.accidentals === 'random' ? pick(['sharps', 'flats'], rng) : settings.accidentals;
  const options = settings.modeOptions;

  switch (modeId) {
    case 'findNote': {
      const { root, interval, upper } = pickSpelledInterval(accidentals, selectedIntervals(options.findNote), rng);
      const rootName = noteName(root, naming);
      return {
        modeId,
        intervalId: interval.id,
        signature: `${modeId}:${noteKey(root)}:${interval.id}`,
        title: 'Find the note',
        prompt: `${interval.name} above ${rootName}`,
        hint: `Which note is a ${interval.name.toLowerCase()} above ${rootName}?`,
        text: `${interval.name} above ${rootName}`,
        parts: singlePart('note', noteChoices(accidentals, naming), noteKey(upper)),
        answerLabel: noteName(upper, naming),
      };
    }

    case 'nameInterval': {
      const intervals = selectedIntervals(options.nameInterval);
      const { root, interval, upper } = pickSpelledInterval(accidentals, intervals, rng);
      const rootName = noteName(root, naming);
      const upperName = noteName(upper, naming);
      return {
        modeId,
        intervalId: interval.id,
        signature: `${modeId}:${noteKey(root)}:${interval.id}`,
        title: 'Name the interval',
        prompt: `${rootName} → ${upperName}`,
        hint: `What is the interval from ${rootName} up to ${upperName}?`,
        text: `${rootName} up to ${upperName}: which interval?`,
        parts: singlePart('interval', intervalChoices(intervals), interval.id),
        answerLabel: `${interval.id} (${interval.name})`,
      };
    }

    case 'notesToTones': {
      const intervals = toneIntervals(options.notesToTones);
      const { root, interval, upper } = pickSpelledInterval(accidentals, intervals, rng);
      // Beyond an octave, the same two note names could be a 3rd or a 10th apart, so show octave numbers.
      const withOctaves = options.notesToTones.range !== 'octave';
      const rootName = noteName(root, naming) + (withOctaves ? ROOT_OCTAVE : '');
      const upperName =
        noteName(upper, naming) + (withOctaves ? ROOT_OCTAVE + octavesCrossed(root, interval) : '');
      return {
        modeId,
        intervalId: interval.id,
        signature: `${modeId}:${noteKey(root)}:${interval.id}`,
        title: 'How many tones apart?',
        prompt: `${rootName} → ${upperName}`,
        hint: `How many tones is it from ${rootName} up to ${upperName}?`,
        text: `${rootName} up to ${upperName}: how many tones?`,
        parts: singlePart('tones', toneChoices(intervals), String(interval.semitones)),
        answerLabel: tonesLabel(interval.semitones),
      };
    }

    case 'intervalToTones': {
      const intervals = toneIntervals(options.intervalToTones);
      const interval = pick(intervals, rng);
      return {
        modeId,
        intervalId: interval.id,
        signature: `${modeId}:${interval.id}`,
        title: 'How many tones?',
        prompt: interval.name,
        hint: `How many tones does a ${interval.name.toLowerCase()} span?`,
        text: `${interval.name}: how many tones?`,
        parts: singlePart('tones', toneChoices(intervals), String(interval.semitones)),
        answerLabel: tonesLabel(interval.semitones),
      };
    }

    case 'degreeToChord':
      return degreeToChordQuestion(options.degreeToChord, accidentals, naming, rng);
  }
}

/** Makes a question, avoiding an exact repeat of the previous one where possible. */
export function makeFreshQuestion(
  modeId: ModeId,
  settings: Settings,
  rng: Rng,
  previousSignature: string | null,
): Question {
  let question = makeQuestion(modeId, settings, rng);
  for (let attempt = 0; attempt < 10 && question.signature === previousSignature; attempt++) {
    question = makeQuestion(modeId, settings, rng);
  }
  return question;
}
