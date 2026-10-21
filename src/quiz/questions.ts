import {
  formatTones,
  octavesCrossed,
  spelledIntervals,
  tonesLabel,
  type Interval,
  type SpelledInterval,
} from '../theory/intervals';
import { noteKey, noteName, notesFor, type AccidentalSet, type Naming } from '../theory/notes';
import { selectedIntervals, toneIntervals } from './modeOptions';
import type { Choice, ModeId, Question, Rng, Settings } from './types';

/** The octave number shown for the lower note when notes need octave numbers, as in C4 → E5. */
const ROOT_OCTAVE = 4;

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
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
        answerType: 'note',
        choices: noteChoices(accidentals, naming),
        answerKey: noteKey(upper),
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
        answerType: 'interval',
        choices: intervalChoices(intervals),
        answerKey: interval.id,
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
        answerType: 'tones',
        choices: toneChoices(intervals),
        answerKey: String(interval.semitones),
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
        answerType: 'tones',
        choices: toneChoices(intervals),
        answerKey: String(interval.semitones),
        answerLabel: tonesLabel(interval.semitones),
      };
    }
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
