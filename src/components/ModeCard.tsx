import type { Mode } from '../quiz/modes';

interface ModeCardProps {
  mode: Mode;
  selected: boolean;
  summary: string;
  onToggle: () => void;
  onOpenOptions: () => void;
}

export function ModeCard({ mode, selected, summary, onToggle, onOpenOptions }: ModeCardProps) {
  return (
    <div className="mode-card" data-selected={selected}>
      <button type="button" className="mode-toggle" aria-pressed={selected} onClick={onToggle}>
        <span className="mode-check" aria-hidden="true">
          {selected ? '✓' : ''}
        </span>
        <span className="mode-title">{mode.title}</span>
        <span className="mode-description">{mode.description}</span>
        <span className="mode-summary">{summary}</span>
      </button>
      <button
        type="button"
        className="mode-gear"
        aria-label={`Options for ${mode.title}`}
        title="Options"
        onClick={onOpenOptions}
      >
        <GearIcon />
      </button>
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
