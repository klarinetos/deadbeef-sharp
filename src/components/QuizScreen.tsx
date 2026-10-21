import { useEffect, useRef, useState } from 'react';
import { createModePicker, type ModePicker } from '../quiz/picker';
import { makeFreshQuestion } from '../quiz/questions';
import type { AnswerRecord, Choice, Question, Settings } from '../quiz/types';

interface QuizScreenProps {
  settings: Settings;
  onFinish: (records: AnswerRecord[]) => void;
}

interface QuizState {
  pick: ModePicker;
  question: Question;
  number: number;
  records: AnswerRecord[];
  chosenKey: string | null;
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
      chosenKey: null,
    };
  });
  const { question, number, records, chosenKey } = state;

  const total = settings.count === 'infinite' ? null : settings.count;
  const answered = chosenKey !== null;
  const lastRecord = records[records.length - 1];
  const isLast = total !== null && number >= total;
  const score = records.filter((record) => record.correct).length;

  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered) nextButton.current?.focus();
  }, [answered]);

  function choose(choice: Choice) {
    if (answered) return;
    const record: AnswerRecord = {
      modeId: question.modeId,
      text: question.text,
      given: choice.longLabel ?? choice.label,
      answer: question.answerLabel,
      correct: choice.key === question.answerKey,
    };
    setState({ ...state, chosenKey: choice.key, records: [...records, record] });
  }

  function next() {
    if (isLast) {
      onFinish(records);
      return;
    }
    // Picking happens here, outside any state updater, so each call advances the picker exactly once.
    const nextQuestion = makeFreshQuestion(state.pick(), settings, Math.random, question.signature);
    setState({ ...state, question: nextQuestion, number: number + 1, chosenKey: null });
  }

  function choiceState(choice: Choice): string {
    if (!answered) return '';
    if (choice.key === question.answerKey) return 'is-correct';
    if (choice.key === chosenKey) return 'is-wrong';
    return 'is-dim';
  }

  const completed = answered ? number : number - 1;

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

      <div className={`choices choices-${question.answerType}`} role="group" aria-label="Answers">
        {question.choices.map((choice) => (
          <button
            key={choice.key}
            type="button"
            className={`choice ${choiceState(choice)}`}
            aria-label={choice.longLabel ?? choice.label}
            style={choice.row ? { gridRow: choice.row, gridColumn: choice.column } : undefined}
            disabled={answered}
            onClick={() => choose(choice)}
          >
            <span className="choice-label">{choice.label}</span>
            {choice.detail && <span className="choice-detail">{choice.detail}</span>}
          </button>
        ))}
      </div>

      <div className="feedback-slot" aria-live="polite">
        {answered && lastRecord && (
          <div className={`feedback ${lastRecord.correct ? 'is-correct' : 'is-wrong'}`}>
            <p className="feedback-text">
              {lastRecord.correct ? (
                'Correct!'
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
