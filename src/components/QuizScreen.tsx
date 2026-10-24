import { useEffect, useRef, useState } from 'react';
import { createModePicker, type ModePicker } from '../quiz/picker';
import { makeFreshQuestion } from '../quiz/questions';
import type { AnswerPart, AnswerRecord, Choice, Question, Settings } from '../quiz/types';

interface QuizScreenProps {
  settings: Settings;
  onFinish: (records: AnswerRecord[]) => void;
}

/** The chosen choice key for each answer part, by part id. */
type Selections = Record<string, string>;

interface QuizState {
  pick: ModePicker;
  question: Question;
  number: number;
  records: AnswerRecord[];
  selections: Selections;
  checked: boolean;
}

function choiceLabel(part: AnswerPart, key: string): string {
  const choice = part.choices.find((candidate) => candidate.key === key);
  return choice ? (choice.longLabel ?? choice.label) : key;
}

export function QuizScreen({ settings, onFinish }: QuizScreenProps) {
  // One initializer, so the picker and the first question always belong together.
  const [state, setState] = useState<QuizState>(() => {
    const pick = createModePicker(settings, Math.random);
    return {
      pick,
      question: makeFreshQuestion(pick(), settings, Math.random, null),
      number: 1,
      records: [],
      selections: {},
      checked: false,
    };
  });
  const { question, number, records, selections, checked } = state;

  const total = settings.count === 'infinite' ? null : settings.count;
  const multiPart = question.parts.length > 1;
  const complete = question.parts.every((part) => part.id in selections);
  const lastRecord = records[records.length - 1];
  const isLast = total !== null && number >= total;
  const score = records.filter((record) => record.correct).length;

  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (checked) nextButton.current?.focus();
  }, [checked]);

  function check(chosen: Selections) {
    const record: AnswerRecord = {
      modeId: question.modeId,
      text: question.text,
      given: question.parts.map((part) => choiceLabel(part, chosen[part.id])).join(', '),
      answer: question.answerLabel,
      correct: question.parts.every((part) => chosen[part.id] === part.answerKey),
    };
    setState({ ...state, selections: chosen, checked: true, records: [...records, record] });
  }

  function choose(part: AnswerPart, choice: Choice) {
    if (checked) return;
    const chosen = { ...selections, [part.id]: choice.key };
    // A single-part answer is checked straight away; multi-part answers wait for the Check button.
    if (multiPart) setState({ ...state, selections: chosen });
    else check(chosen);
  }

  function next() {
    if (isLast) {
      onFinish(records);
      return;
    }
    // Picking happens here, outside any state updater, so each call advances the picker exactly once.
    const nextQuestion = makeFreshQuestion(state.pick(), settings, Math.random, question.signature);
    setState({ ...state, question: nextQuestion, number: number + 1, selections: {}, checked: false });
  }

  function choiceState(part: AnswerPart, choice: Choice): string {
    const selected = selections[part.id] === choice.key;
    if (!checked) return selected ? 'is-selected' : '';
    if (choice.key === part.answerKey) return 'is-correct';
    if (selected) return 'is-wrong';
    return 'is-dim';
  }

  const completed = checked ? number : number - 1;

  return (
    <div className="quiz">
      <div className="quiz-bar">
        <span className="quiz-progress">{total ? `Question ${number} of ${total}` : `Question ${number}`}</span>
        <span className="quiz-score">
          {score} correct{records.length > 0 && ` of ${records.length}`}
        </span>
        <button type="button" className="button ghost small" onClick={() => onFinish(records)}>
          End
        </button>
      </div>
      {total && (
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      )}

      <section className="prompt-card">
        <p className="prompt-title">{question.title}</p>
        <p className="prompt">{question.prompt}</p>
        <p className="prompt-hint">{question.hint}</p>
      </section>

      {question.parts.map((part) => (
        <div className="answer-part" key={part.id}>
          {multiPart && <h2 className="setting-label">{part.label}</h2>}
          <div className={`choices choices-${part.layout}`} role="group" aria-label={part.label}>
            {part.choices.map((choice) => (
              <button
                key={choice.key}
                type="button"
                className={`choice ${choiceState(part, choice)}`}
                aria-label={choice.longLabel ?? choice.label}
                aria-pressed={multiPart && !checked ? selections[part.id] === choice.key : undefined}
                style={choice.row ? { gridRow: choice.row, gridColumn: choice.column } : undefined}
                disabled={checked}
                onClick={() => choose(part, choice)}
              >
                <span className="choice-label">{choice.label}</span>
                {choice.detail && <span className="choice-detail">{choice.detail}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="feedback-slot" aria-live="polite">
        {!checked && multiPart && (
          <div className="check-row">
            <button type="button" className="button primary" disabled={!complete} onClick={() => check(selections)}>
              Check
            </button>
            {!complete && <span className="setting-help">Pick an answer in each row.</span>}
          </div>
        )}
        {checked && lastRecord && (
          <div className={`feedback ${lastRecord.correct ? 'is-correct' : 'is-wrong'}`}>
            <p className="feedback-text">
              {lastRecord.correct ? (
                <>
                  Correct! <strong>{question.answerLabel}</strong>
                </>
              ) : (
                <>
                  Not quite. The answer is <strong>{question.answerLabel}</strong>.
                </>
              )}
            </p>
            <button ref={nextButton} type="button" className="button primary" onClick={next}>
              {isLast ? 'See results' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
