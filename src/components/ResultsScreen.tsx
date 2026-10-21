import { MODES } from '../quiz/modes';
import type { AnswerRecord } from '../quiz/types';

interface ResultsScreenProps {
  records: AnswerRecord[];
  onPlayAgain: () => void;
  onChangeSettings: () => void;
}

function percent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function ResultsScreen({ records, onPlayAgain, onChangeSettings }: ResultsScreenProps) {
  const total = records.length;
  const correct = records.filter((record) => record.correct).length;
  const missed = records.filter((record) => !record.correct);

  const byMode = MODES.map((mode) => {
    const answers = records.filter((record) => record.modeId === mode.id);
    return { mode, total: answers.length, correct: answers.filter((record) => record.correct).length };
  }).filter((row) => row.total > 0);

  return (
    <div className="results">
      <section className="results-summary">
        <p className="results-label">Your score</p>
        <p className="results-score">
          {correct}
          <span className="results-total"> / {total}</span>
        </p>
        <p className="results-percent">
          {total === 0
            ? 'No questions answered.'
            : missed.length === 0
              ? 'Perfect score.'
              : `${percent(correct, total)}% correct`}
        </p>
      </section>

      {byMode.length > 0 && (
        <section className="card">
          <h2 className="card-title">By question type</h2>
          <ul className="breakdown">
            {byMode.map((row) => (
              <li key={row.mode.id}>
                <div className="breakdown-head">
                  <span>{row.mode.title}</span>
                  <span className="breakdown-count">
                    {row.correct} / {row.total}
                  </span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${percent(row.correct, row.total)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {missed.length > 0 && (
        <section className="card">
          <h2 className="card-title">To review</h2>
          <ul className="missed">
            {missed.map((record, index) => (
              <li key={index}>
                <span className="missed-question">{record.text}</span>
                <span className="missed-answers">
                  You said <span className="missed-given">{record.given}</span>. Answer:{' '}
                  <strong className="missed-answer">{record.answer}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="actions">
        <button type="button" className="button primary large" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="button ghost large" onClick={onChangeSettings}>
          Change settings
        </button>
      </div>
    </div>
  );
}
