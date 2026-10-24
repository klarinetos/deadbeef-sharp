import { describe, expect, it } from 'vitest';
import { INTERVALS } from '../src/theory/intervals';
import { MODE_IDS } from '../src/quiz/modes';
import { createModePicker } from '../src/quiz/picker';
import { makeFreshQuestion, makeQuestion } from '../src/quiz/questions';
import { DEFAULT_SETTINGS, sanitizeSettings, startProblem } from '../src/quiz/settings';
import type { ModeId, Rng, Settings } from '../src/quiz/types';

/** A small deterministic random number generator (mulberry32). */
function seeded(seed: number): Rng {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function settingsWith(overrides: Partial<Settings>): Settings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

describe('makeQuestion', () => {
  const namings = ['letters', 'solfege', 'both'] as const;
  const accidentalSettings = ['sharps', 'flats', 'both', 'random'] as const;

  it('always offers the correct answer among the choices, in every part', () => {
    const rng = seeded(1);
    const chordSettings = [
      DEFAULT_SETTINGS.modeOptions.degreeToChord,
      { keys: 'both', minorForm: 'harmonic', sevenths: true, degrees: [1, 2, 3, 4, 5, 6, 7] },
      { keys: 'minor', minorForm: 'natural', sevenths: true, degrees: [1, 2, 3, 4, 5, 6, 7] },
    ] as const;
    for (const modeId of MODE_IDS) {
      for (const naming of namings) {
        for (const accidentals of accidentalSettings) {
          for (const degreeToChord of chordSettings) {
            const settings = settingsWith({
              naming,
              accidentals,
              modeOptions: { ...DEFAULT_SETTINGS.modeOptions, degreeToChord: { ...degreeToChord, degrees: [...degreeToChord.degrees] } },
            });
            for (let i = 0; i < 20; i++) {
              const question = makeQuestion(modeId, settings, rng);
              for (const part of question.parts) {
                const keys = part.choices.map((choice) => choice.key);
                expect(keys).toContain(part.answerKey);
                expect(new Set(keys).size).toBe(keys.length);
              }
            }
          }
        }
      }
    }
  });

  it('never shows flats with sharps only, or sharps with flats only', () => {
    const rng = seeded(2);
    for (const [accidentals, forbidden] of [
      ['sharps', '♭'],
      ['flats', '♯'],
    ] as const) {
      const settings = settingsWith({ accidentals });
      for (let i = 0; i < 200; i++) {
        const question = makeQuestion('findNote', settings, rng);
        expect(question.prompt).not.toContain(forbidden);
        expect(question.answerLabel).not.toContain(forbidden);
        for (const choice of question.parts[0].choices) expect(choice.label).not.toContain(forbidden);
      }
    }
  });

  it('keeps each "random" question to a single kind of accidental', () => {
    const rng = seeded(3);
    const settings = settingsWith({ accidentals: 'random' });
    for (let i = 0; i < 200; i++) {
      const question = makeQuestion('nameInterval', settings, rng);
      expect(question.prompt.includes('♯') && question.prompt.includes('♭')).toBe(false);
    }
  });

  it('uses solfège names when asked', () => {
    const question = makeQuestion('findNote', settingsWith({ naming: 'solfege' }), seeded(4));
    expect(question.prompt).toMatch(/(Do|Re|Mi|Fa|Sol|La|Si)[♯♭]?$/);
  });

  it('answers tone questions in semitones', () => {
    const rng = seeded(5);
    for (let i = 0; i < 50; i++) {
      const question = makeQuestion('intervalToTones', DEFAULT_SETTINGS, rng);
      const semitones = Number(question.parts[0].answerKey);
      expect(semitones).toBeGreaterThanOrEqual(1);
      expect(semitones).toBeLessThanOrEqual(12);
    }
  });
});

describe('question type options', () => {
  function withOptions(modeOptions: Partial<Settings['modeOptions']>): Settings {
    return settingsWith({ modeOptions: { ...DEFAULT_SETTINGS.modeOptions, ...modeOptions } });
  }

  it('only asks about the checked intervals', () => {
    const rng = seeded(10);
    const settings = withOptions({
      findNote: { intervals: ['m3', 'P5'] },
      nameInterval: { intervals: ['A4', 'd5', 'M7'] },
    });
    for (let i = 0; i < 200; i++) {
      expect(['m3', 'P5']).toContain(makeQuestion('findNote', settings, rng).intervalId);
      const question = makeQuestion('nameInterval', settings, rng);
      expect(['A4', 'd5', 'M7']).toContain(question.intervalId);
      expect(question.parts[0].choices.map((choice) => choice.key)).toEqual(['A4', 'd5', 'M7']);
    }
  });

  it('works with every single interval checked on its own, for every accidental setting', () => {
    const rng = seeded(11);
    for (const id of DEFAULT_SETTINGS.modeOptions.findNote.intervals) {
      for (const accidentals of ['sharps', 'flats', 'both', 'random'] as const) {
        const settings = { ...withOptions({ findNote: { intervals: [id] } }), accidentals };
        expect(makeQuestion('findNote', settings, rng).intervalId).toBe(id);
      }
    }
  });

  it('keeps tone questions within the chosen range and numbers', () => {
    const rng = seeded(12);
    const cases = [
      { range: 'octave', numbers: 'all', max: 7, parity: null },
      { range: 'thirteenth', numbers: 'odd', max: 13, parity: 1 },
      { range: 'twoOctaves', numbers: 'even', max: 14, parity: 0 },
    ] as const;
    for (const { range, numbers, max, parity } of cases) {
      const settings = withOptions({
        notesToTones: { range, numbers },
        intervalToTones: { range, numbers },
      });
      for (const modeId of ['notesToTones', 'intervalToTones'] as const) {
        const seen = new Set<number>();
        for (let i = 0; i < 300; i++) {
          const question = makeQuestion(modeId, settings, rng);
          const number = INTERVALS.find((interval) => interval.id === question.intervalId)!.number;
          expect(number).toBeLessThanOrEqual(max);
          expect(number).not.toBe(8);
          if (parity !== null) expect(number % 2).toBe(parity);
          seen.add(number);
        }
        expect(Math.max(...seen)).toBe(max - (parity === null || max % 2 === parity ? 0 : 1));
      }
    }
  });

  it('adds octave numbers to notes only when the range goes past an octave', () => {
    const rng = seeded(13);
    const within = makeQuestion('notesToTones', DEFAULT_SETTINGS, rng);
    expect(within.prompt).not.toMatch(/\d/);
    const beyond = makeQuestion('notesToTones', withOptions({ notesToTones: { range: 'twoOctaves', numbers: 'all' } }), rng);
    expect(beyond.prompt).toMatch(/^\D+4 → \D+[456]$/);
  });

  it('offers tone answers up to the largest interval in range', () => {
    const settings = withOptions({ intervalToTones: { range: 'thirteenth', numbers: 'all' } });
    const question = makeQuestion('intervalToTones', settings, seeded(14));
    expect(question.parts[0].choices).toHaveLength(21);
    expect(question.parts[0].choices.at(-1)?.label).toBe('10½');
  });
});

describe('degree to chord questions', () => {
  function chordSettings(degreeToChord: Partial<Settings['modeOptions']['degreeToChord']>): Settings {
    return settingsWith({
      modeOptions: {
        ...DEFAULT_SETTINGS.modeOptions,
        degreeToChord: { ...DEFAULT_SETTINGS.modeOptions.degreeToChord, ...degreeToChord },
      },
    });
  }

  it('asks for root and quality, plus the 7th when sevenths are on', () => {
    const triad = makeQuestion('degreeToChord', chordSettings({ sevenths: false }), seeded(20));
    expect(triad.parts.map((part) => part.id)).toEqual(['root', 'triad']);
    const seventh = makeQuestion('degreeToChord', chordSettings({ sevenths: true }), seeded(20));
    expect(seventh.parts.map((part) => part.id)).toEqual(['root', 'triad', 'seventh']);
  });

  it('only uses the chosen keys and degrees', () => {
    const rng = seeded(21);
    const settings = chordSettings({ keys: 'minor', minorForm: 'natural', degrees: [5, 7] });
    for (let i = 0; i < 200; i++) {
      const question = makeQuestion('degreeToChord', settings, rng);
      expect(question.prompt).toMatch(/^(Dominant|Subtonic) of .+ minor$/);
      // In natural minor the dominant is a minor chord and the subtonic a major one.
      const triad = question.parts[1].answerKey;
      expect(triad).toBe(question.prompt.startsWith('Dominant') ? 'minor' : 'major');
    }
  });

  it('gives the full answer with a chord symbol', () => {
    const rng = seeded(22);
    const settings = chordSettings({ keys: 'major', sevenths: true, degrees: [5] });
    for (let i = 0; i < 50; i++) {
      const question = makeQuestion('degreeToChord', settings, rng);
      expect(question.answerLabel).toMatch(/^\S+, major, minor 7th \(\S+7\)$/);
    }
  });
});

describe('makeFreshQuestion', () => {
  it('avoids repeating the previous question', () => {
    const rng = seeded(6);
    let previous: string | null = null;
    for (let i = 0; i < 200; i++) {
      const question = makeFreshQuestion('intervalToTones', DEFAULT_SETTINGS, rng, previous);
      expect(question.signature).not.toBe(previous);
      previous = question.signature;
    }
  });
});

describe('createModePicker', () => {
  it('cycles in order for round robin', () => {
    const pick = createModePicker(
      settingsWith({ order: 'roundRobin', modes: ['findNote', 'notesToTones'] }),
      seeded(7),
    );
    expect([pick(), pick(), pick(), pick()]).toEqual(['findNote', 'notesToTones', 'findNote', 'notesToTones']);
  });

  it('only picks selected types', () => {
    const pick = createModePicker(settingsWith({ order: 'uniform', modes: ['nameInterval'] }), seeded(8));
    for (let i = 0; i < 20; i++) expect(pick()).toBe('nameInterval');
  });

  it('follows custom odds, and never picks a type with zero odds', () => {
    const pick = createModePicker(
      settingsWith({
        order: 'weighted',
        weights: { findNote: 3, nameInterval: 1, notesToTones: 0, intervalToTones: 0, degreeToChord: 0 },
      }),
      seeded(9),
    );
    const counts: Record<ModeId, number> = {
      findNote: 0,
      nameInterval: 0,
      notesToTones: 0,
      intervalToTones: 0,
      degreeToChord: 0,
    };
    for (let i = 0; i < 4000; i++) counts[pick()]++;
    expect(counts.notesToTones).toBe(0);
    expect(counts.intervalToTones).toBe(0);
    expect(counts.findNote / 4000).toBeCloseTo(0.75, 1);
  });
});

describe('settings', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    const settings = sanitizeSettings({ modes: ['nope'], count: 7, naming: 'letters', weights: { findNote: -1 } });
    expect(settings.modes).toEqual(DEFAULT_SETTINGS.modes);
    expect(settings.count).toBe(DEFAULT_SETTINGS.count);
    expect(settings.weights.findNote).toBe(DEFAULT_SETTINGS.weights.findNote);
  });

  it('cleans up question type options', () => {
    const settings = sanitizeSettings({
      modeOptions: {
        findNote: { intervals: ['P5', 'P8', 'bogus', 'm3'] },
        nameInterval: { intervals: [] },
        notesToTones: { range: 'thirteenth', numbers: 'prime' },
      },
    });
    expect(settings.modeOptions.findNote.intervals).toEqual(['m3', 'P5']);
    expect(settings.modeOptions.nameInterval).toEqual(DEFAULT_SETTINGS.modeOptions.nameInterval);
    expect(settings.modeOptions.notesToTones).toEqual({ range: 'thirteenth', numbers: 'all' });
    expect(settings.modeOptions.intervalToTones).toEqual(DEFAULT_SETTINGS.modeOptions.intervalToTones);
  });

  it('keeps valid values', () => {
    const settings = sanitizeSettings({ modes: ['notesToTones'], count: 'infinite', accidentals: 'random' });
    expect(settings.modes).toEqual(['notesToTones']);
    expect(settings.count).toBe('infinite');
    expect(settings.accidentals).toBe('random');
  });

  it('blocks starting when every custom odd is zero', () => {
    const weights = { findNote: 0, nameInterval: 0, notesToTones: 0, intervalToTones: 0, degreeToChord: 0 };
    expect(startProblem(settingsWith({ order: 'weighted', weights }))).not.toBeNull();
    expect(startProblem(settingsWith({ order: 'uniform', weights }))).toBeNull();
  });
});
