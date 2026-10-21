import { useId } from 'react';

export interface Option<T> {
  value: T;
  label: string;
  description?: string;
}

interface OptionGroupProps<T> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of mutually exclusive buttons, with the selected option's description below. */
export function OptionGroup<T extends string | number>({ label, options, value, onChange }: OptionGroupProps<T>) {
  const labelId = useId();
  const selected = options.find((option) => option.value === value);

  return (
    <section className="setting">
      <h2 className="setting-label" id={labelId}>
        {label}
      </h2>
      <div className="segmented" role="radiogroup" aria-labelledby={labelId}>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            className="segment"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selected?.description && <p className="setting-help">{selected.description}</p>}
    </section>
  );
}
