import { useEffect, useId, useRef } from 'react';
import { SIMPLE_INTERVALS } from '../theory/intervals';
import {
  NUMBER_LABELS,
  NUMBER_FILTERS,
  RANGE_LABELS,
  TONE_RANGES,
  isIntervalMode,
  pluralOrdinal,
  toneIntervals,
} from '../quiz/modeOptions';
import { modeTitle } from '../quiz/modes';
import type { IntervalOptions, ModeId, ModeOptions, NumberFilter, ToneOptions, ToneRange } from '../quiz/types';
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
