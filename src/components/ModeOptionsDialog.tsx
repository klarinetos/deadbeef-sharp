import { useEffect, useId, useRef } from 'react';
import { SIMPLE_INTERVALS } from '../theory/intervals';
import { DEGREES, type MinorForm } from '../theory/keys';
import {
  DEGREE_LABELS,
  NUMBER_LABELS,
  NUMBER_FILTERS,
  RANGE_LABELS,
  TONE_RANGES,
  isIntervalMode,
  pluralOrdinal,
  toneIntervals,
} from '../quiz/modeOptions';
import { modeTitle } from '../quiz/modes';
import type {
  ChordOptions,
  IntervalOptions,
  KeySetting,
  ModeId,
  ModeOptions,
  NumberFilter,
  ToneOptions,
  ToneRange,
} from '../quiz/types';
import { OptionGroup, type Option } from './OptionGroup';

const RANGE_DESCRIPTIONS: Record<ToneRange, string> = {
  octave: '2nds up to 7ths.',
  thirteenth: '2nds up to 13ths, skipping the octave. Notes get octave numbers, such as C4 → E5.',
  twoOctaves: '2nds up to 14ths, skipping the octave. Notes get octave numbers, such as C4 → E5.',
};

const RANGE_OPTIONS: Option<ToneRange>[] = TONE_RANGES.map((value) => ({
  value,
  label: RANGE_LABELS[value],
  description: RANGE_DESCRIPTIONS[value],
}));

const NUMBER_OPTIONS: Option<NumberFilter>[] = NUMBER_FILTERS.map((value) => ({ value, label: NUMBER_LABELS[value] }));

interface ModeOptionsDialogProps {
  modeId: ModeId;
  options: ModeOptions;
  onChange: (options: ModeOptions) => void;
  onClose: () => void;
}

export function ModeOptionsDialog({ modeId, options, onChange, onClose }: ModeOptionsDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="dialog-body">
        <h2 className="dialog-title" id={titleId}>
          {modeTitle(modeId)} options
        </h2>

        {isIntervalMode(modeId) ? (
          <IntervalPicker value={options[modeId]} onChange={(value) => onChange({ ...options, [modeId]: value })} />
        ) : modeId === 'degreeToChord' ? (
          <ChordOptionsPicker
            value={options.degreeToChord}
            onChange={(value) => onChange({ ...options, degreeToChord: value })}
          />
        ) : (
          <ToneOptionsPicker
            value={options[modeId]}
            onChange={(value) => onChange({ ...options, [modeId]: value })}
          />
        )}

        <div className="dialog-actions">
          <button type="button" className="button primary" onClick={() => dialog.current?.close()}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}

function IntervalPicker({ value, onChange }: { value: IntervalOptions; onChange: (value: IntervalOptions) => void }) {
  const selected = new Set(value.intervals);
  const allIds = SIMPLE_INTERVALS.map((interval) => interval.id);

  function toggle(id: (typeof allIds)[number]) {
    if (selected.has(id) && selected.size === 1) return;
    onChange({ intervals: allIds.filter((other) => (other === id ? !selected.has(id) : selected.has(other))) });
  }

  return (
    <section className="setting">
      <div className="setting-head">
        <h3 className="setting-label">Intervals</h3>
        <button
          type="button"
          className="link-button"
          disabled={selected.size === allIds.length}
          onClick={() => onChange({ intervals: allIds })}
        >
          Select all
        </button>
      </div>
      <div className="checkbox-grid">
        {SIMPLE_INTERVALS.map((interval) => (
          <label className="checkbox" key={interval.id}>
            <input type="checkbox" checked={selected.has(interval.id)} onChange={() => toggle(interval.id)} />
            <span className="checkbox-id">{interval.id}</span>
            <span className="checkbox-name">{interval.name}</span>
          </label>
        ))}
      </div>
      <p className="setting-help">Pick at least one.</p>
    </section>
  );
}

const KEY_OPTIONS: Option<KeySetting>[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'both', label: 'Both' },
];

const MINOR_FORM_OPTIONS: Option<MinorForm>[] = [
  {
    value: 'harmonic',
    label: 'Harmonic minor',
    description: 'Raised 7th: the dominant is major and the 7th degree is the leading tone.',
  },
  {
    value: 'natural',
    label: 'Natural minor',
    description: 'No raised 7th: the dominant is minor and the 7th degree is the subtonic.',
  },
];

const SEVENTH_OPTIONS: Option<'triads' | 'sevenths'>[] = [
  { value: 'triads', label: 'Triads', description: 'Answer with the root and quality.' },
  {
    value: 'sevenths',
    label: 'Seventh chords',
    description: 'Also answer with the quality of the 7th: major, minor, or diminished.',
  },
];

function ChordOptionsPicker({ value, onChange }: { value: ChordOptions; onChange: (value: ChordOptions) => void }) {
  const selected = new Set(value.degrees);

  function toggle(degree: number) {
    if (selected.has(degree) && selected.size === 1) return;
    onChange({ ...value, degrees: DEGREES.filter((other) => (other === degree ? !selected.has(degree) : selected.has(other))) });
  }

  return (
    <>
      <OptionGroup label="Keys" options={KEY_OPTIONS} value={value.keys} onChange={(keys) => onChange({ ...value, keys })} />
      {value.keys !== 'major' && (
        <OptionGroup
          label="Minor scale"
          options={MINOR_FORM_OPTIONS}
          value={value.minorForm}
          onChange={(minorForm) => onChange({ ...value, minorForm })}
        />
      )}
      <OptionGroup
        label="Chords"
        options={SEVENTH_OPTIONS}
        value={value.sevenths ? 'sevenths' : 'triads'}
        onChange={(kind) => onChange({ ...value, sevenths: kind === 'sevenths' })}
      />
      <section className="setting">
        <div className="setting-head">
          <h3 className="setting-label">Degrees</h3>
          <button
            type="button"
            className="link-button"
            disabled={selected.size === DEGREES.length}
            onClick={() => onChange({ ...value, degrees: [...DEGREES] })}
          >
            Select all
          </button>
        </div>
        <div className="checkbox-grid">
          {DEGREES.map((degree) => (
            <label className="checkbox" key={degree}>
              <input type="checkbox" checked={selected.has(degree)} onChange={() => toggle(degree)} />
              <span className="checkbox-id">{degree}</span>
              <span className="checkbox-name">{DEGREE_LABELS[degree]}</span>
            </label>
          ))}
        </div>
      </section>
    </>
  );
}

function ToneOptionsPicker({ value, onChange }: { value: ToneOptions; onChange: (value: ToneOptions) => void }) {
  const numbers = [...new Set(toneIntervals(value).map((interval) => interval.number))];

  return (
    <>
      <OptionGroup
        label="Range"
        options={RANGE_OPTIONS}
        value={value.range}
        onChange={(range) => onChange({ ...value, range })}
      />
      <OptionGroup
        label="Interval numbers"
        options={NUMBER_OPTIONS}
        value={value.numbers}
        onChange={(numbersFilter) => onChange({ ...value, numbers: numbersFilter })}
      />
      <p className="setting-help">Includes {numbers.map(pluralOrdinal).join(', ')}.</p>
    </>
  );
}
