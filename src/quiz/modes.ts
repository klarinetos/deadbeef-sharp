import type { ModeId } from './types';

export interface Mode {
  id: ModeId;
  title: string;
  description: string;
}

export const MODES: readonly Mode[] = [
  {
    id: 'findNote',
    title: 'Find the note',
    description: 'Given a root note and an interval, find the other note.',
  },
  {
    id: 'nameInterval',
    title: 'Name the interval',
    description: 'Given two notes, name the interval between them.',
  },
  {
    id: 'notesToTones',
    title: 'Notes to tones',
    description: 'Given two notes, count how many tones apart they are.',
  },
  {
    id: 'intervalToTones',
    title: 'Interval to tones',
    description: 'Given an interval, say how many tones it spans.',
  },
  {
    id: 'tonesToInterval',
    title: 'Tones to interval',
    description: 'Given a number of tones, name the interval that spans it.',
  },
  {
    id: 'degreeToChord',
    title: 'Degree to chord',
    description: 'Given a key and a degree, such as the dominant of D major, name the chord.',
  },
];

export const MODE_IDS: readonly ModeId[] = MODES.map((mode) => mode.id);

export function modeTitle(id: ModeId): string {
  return MODES.find((mode) => mode.id === id)?.title ?? id;
}
