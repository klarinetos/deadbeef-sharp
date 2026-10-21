import { useState } from 'react';
import { modeSummary } from '../quiz/modeOptions';
import { MODES, MODE_IDS, modeTitle } from '../quiz/modes';
import { MAX_WEIGHT, startProblem } from '../quiz/settings';
import type {
  AccidentalSetting,
  ModeId,
  NamingSetting,
  Order,
  QuestionCount,
  Settings,
} from '../quiz/types';
import { ModeCard } from './ModeCard';
import { ModeOptionsDialog } from './ModeOptionsDialog';
import { OptionGroup, type Option } from './OptionGroup';

const ORDER_OPTIONS: Option<Order>[] = [
  { value: 'roundRobin', label: 'Round robin', description: 'Cycle through the selected types in order.' },
  { value: 'uniform', label: 'Random', description: 'Pick a type at random each time, all equally likely.' },
  { value: 'weighted', label: 'Custom odds', description: 'Pick a type at random, using odds you set.' },
];

const COUNT_OPTIONS: Option<QuestionCount>[] = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 'infinite', label: '∞', description: 'Keep going until you press End.' },
];

const NAMING_OPTIONS: Option<NamingSetting>[] = [
  { value: 'letters', label: 'C D E', description: 'Letter names: C D E F G A B.' },
  { value: 'solfege', label: 'Do Re Mi', description: 'Solfège: Do Re Mi Fa Sol La Si.' },
  { value: 'both', label: 'Both', description: 'Each question uses letters or solfège, chosen at random.' },
];

const ACCIDENTAL_OPTIONS: Option<AccidentalSetting>[] = [
  { value: 'sharps', label: 'Sharps ♯', description: 'Only naturals and sharps, such as C♯ and F♯.' },
  { value: 'flats', label: 'Flats ♭', description: 'Only naturals and flats, such as B♭ and E♭.' },
  { value: 'both', label: 'Both', description: 'Sharps and flats can appear in the same question.' },
  {
    value: 'random',
    label: 'Random',
    description: 'Each question uses only sharps or only flats, chosen at random.',
  },
];

interface SettingsScreenProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onStart: () => void;
}

export function SettingsScreen({ settings, onChange, onStart }: SettingsScreenProps) {
  const problem = startProblem(settings);
  const [optionsFor, setOptionsFor] = useState<ModeId | null>(null);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    onChange({ ...settings, [key]: value });
  }

  function toggleMode(id: ModeId) {
    const selected = settings.modes.includes(id);
    if (selected && settings.modes.length === 1) return;
    const modes = selected
      ? settings.modes.filter((mode) => mode !== id)
      : MODE_IDS.filter((mode) => mode === id || settings.modes.includes(mode));
    update('modes', modes);
  }

  function changeWeight(id: ModeId, delta: number) {
    const weight = Math.min(MAX_WEIGHT, Math.max(0, settings.weights[id] + delta));
    update('weights', { ...settings.weights, [id]: weight });
  }

  const totalWeight = settings.modes.reduce((sum, id) => sum + settings.weights[id], 0);

  return (
    <div className="settings">
      <section className="setting">
        <h2 className="setting-label">Question types</h2>
        <div className="mode-grid">
          {MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              selected={settings.modes.includes(mode.id)}
              summary={modeSummary(mode.id, settings.modeOptions)}
              onToggle={() => toggleMode(mode.id)}
              onOpenOptions={() => setOptionsFor(mode.id)}
            />
          ))}
        </div>
        <p className="setting-help">Pick one or more. Use the gear to choose what each type asks about.</p>
      </section>

      {optionsFor && (
        <ModeOptionsDialog
          modeId={optionsFor}
          options={settings.modeOptions}
          onChange={(modeOptions) => update('modeOptions', modeOptions)}
          onClose={() => setOptionsFor(null)}
        />
      )}

      <OptionGroup label="Order" options={ORDER_OPTIONS} value={settings.order} onChange={(v) => update('order', v)} />

      {settings.order === 'weighted' && (
        <section className="weights" aria-label="Odds for each question type">
          {settings.modes.map((id) => {
            const weight = settings.weights[id];
            const title = modeTitle(id);
            const percent = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
            return (
              <div className="weight-row" key={id}>
                <span className="weight-name">{title}</span>
                <div className="stepper">
                  <button
                    type="button"
                    aria-label={`Lower odds for ${title}`}
                    disabled={weight === 0}
                    onClick={() => changeWeight(id, -1)}
                  >
                    −
                  </button>
                  <span className="stepper-value" aria-live="polite">
                    {weight}
                  </span>
                  <button
                    type="button"
                    aria-label={`Raise odds for ${title}`}
                    disabled={weight === MAX_WEIGHT}
                    onClick={() => changeWeight(id, 1)}
                  >
                    +
                  </button>
                </div>
                <span className="weight-percent">{percent}%</span>
              </div>
            );
          })}
        </section>
      )}

      <OptionGroup
        label="Number of questions"
        options={COUNT_OPTIONS}
        value={settings.count}
        onChange={(v) => update('count', v)}
      />
      <OptionGroup
        label="Note names"
        options={NAMING_OPTIONS}
        value={settings.naming}
        onChange={(v) => update('naming', v)}
      />
      <OptionGroup
        label="Accidentals"
        options={ACCIDENTAL_OPTIONS}
        value={settings.accidentals}
        onChange={(v) => update('accidentals', v)}
      />

      <div className="start">
        <button type="button" className="button primary large" disabled={problem !== null} onClick={onStart}>
          Start
        </button>
        {problem && <p className="start-problem">{problem}</p>}
      </div>
    </div>
  );
}
