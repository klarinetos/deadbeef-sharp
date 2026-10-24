import { SIMPLE_INTERVALS } from '../theory/intervals';
import { DEGREES } from '../theory/keys';
import { DEFAULT_MODE_OPTIONS, KEY_SETTINGS, MINOR_FORMS, NUMBER_FILTERS, TONE_RANGES } from './modeOptions';
import { MODE_IDS } from './modes';
import type {
  AccidentalSetting,
  ChordOptions,
  IntervalOptions,
  ModeId,
  ModeOptions,
  NamingSetting,
  Order,
  QuestionCount,
  Settings,
  ToneOptions,
} from './types';

export const COUNTS: readonly QuestionCount[] = [5, 10, 20, 50, 'infinite'];
export const ORDERS: readonly Order[] = ['roundRobin', 'uniform', 'weighted'];
export const NAMINGS: readonly NamingSetting[] = ['letters', 'solfege', 'both'];
export const ACCIDENTALS: readonly AccidentalSetting[] = ['sharps', 'flats', 'both', 'random'];
export const MAX_WEIGHT = 10;

export const DEFAULT_SETTINGS: Settings = {
  modes: [...MODE_IDS],
  order: 'uniform',
  weights: { findNote: 1, nameInterval: 1, notesToTones: 1, intervalToTones: 1, degreeToChord: 1 },
  count: 10,
  naming: 'letters',
  accidentals: 'both',
  modeOptions: DEFAULT_MODE_OPTIONS,
};

const STORAGE_KEY = 'deadbeef-sharp:settings';

function oneOf<T>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function asRecord(raw: unknown): Record<string, unknown> {
  return typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
}

function sanitizeIntervalOptions(raw: unknown, fallback: IntervalOptions): IntervalOptions {
  const stored = asRecord(raw).intervals;
  const intervals = Array.isArray(stored)
    ? SIMPLE_INTERVALS.map((interval) => interval.id).filter((id) => stored.includes(id))
    : [];
  return { intervals: intervals.length > 0 ? intervals : [...fallback.intervals] };
}

function sanitizeToneOptions(raw: unknown, fallback: ToneOptions): ToneOptions {
  const input = asRecord(raw);
  return {
    range: oneOf(TONE_RANGES, input.range, fallback.range),
    numbers: oneOf(NUMBER_FILTERS, input.numbers, fallback.numbers),
  };
}

function sanitizeChordOptions(raw: unknown, fallback: ChordOptions): ChordOptions {
  const input = asRecord(raw);
  const stored = input.degrees;
  const degrees = Array.isArray(stored) ? DEGREES.filter((degree) => stored.includes(degree)) : [];
  return {
    keys: oneOf(KEY_SETTINGS, input.keys, fallback.keys),
    minorForm: oneOf(MINOR_FORMS, input.minorForm, fallback.minorForm),
    sevenths: typeof input.sevenths === 'boolean' ? input.sevenths : fallback.sevenths,
    degrees: degrees.length > 0 ? degrees : [...fallback.degrees],
  };
}

function sanitizeModeOptions(raw: unknown): ModeOptions {
  const input = asRecord(raw);
  return {
    findNote: sanitizeIntervalOptions(input.findNote, DEFAULT_MODE_OPTIONS.findNote),
    nameInterval: sanitizeIntervalOptions(input.nameInterval, DEFAULT_MODE_OPTIONS.nameInterval),
    notesToTones: sanitizeToneOptions(input.notesToTones, DEFAULT_MODE_OPTIONS.notesToTones),
    intervalToTones: sanitizeToneOptions(input.intervalToTones, DEFAULT_MODE_OPTIONS.intervalToTones),
    degreeToChord: sanitizeChordOptions(input.degreeToChord, DEFAULT_MODE_OPTIONS.degreeToChord),
  };
}

/** Turns anything (such as stored JSON) into valid settings, falling back to defaults. */
export function sanitizeSettings(raw: unknown): Settings {
  const input = asRecord(raw) as Partial<Record<keyof Settings, unknown>>;

  const modes = Array.isArray(input.modes)
    ? MODE_IDS.filter((id) => (input.modes as unknown[]).includes(id))
    : [];

  const rawWeights = asRecord(input.weights);
  const weights = Object.fromEntries(
    MODE_IDS.map((id) => {
      const value = rawWeights[id];
      const valid = typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_WEIGHT;
      return [id, valid ? value : DEFAULT_SETTINGS.weights[id]];
    }),
  ) as Record<ModeId, number>;

  return {
    modes: modes.length > 0 ? modes : [...DEFAULT_SETTINGS.modes],
    order: oneOf(ORDERS, input.order, DEFAULT_SETTINGS.order),
    weights,
    count: oneOf(COUNTS, input.count, DEFAULT_SETTINGS.count),
    naming: oneOf(NAMINGS, input.naming, DEFAULT_SETTINGS.naming),
    accidentals: oneOf(ACCIDENTALS, input.accidentals, DEFAULT_SETTINGS.accidentals),
    modeOptions: sanitizeModeOptions(input.modeOptions),
  };
}

/** Why a session can't start with these settings, or null if it can. */
export function startProblem(settings: Settings): string | null {
  if (settings.modes.length === 0) return 'Pick at least one question type.';
  if (settings.order === 'weighted' && settings.modes.every((id) => settings.weights[id] === 0)) {
    return 'Give at least one question type odds above zero.';
  }
  return null;
}

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return sanitizeSettings(JSON.parse(stored));
  } catch {
    // Storage can be unavailable or hold bad data; fall back to defaults.
  }
  return sanitizeSettings(DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Settings simply won't persist.
  }
}
