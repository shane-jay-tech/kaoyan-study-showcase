import type { Dispatch } from 'react';
import {
  QUIZ_FIXTURES,
  type QuizQuestion,
} from '../../data/demo-fixtures';
import {
  selectCurrentAnswerCorrect,
  selectCurrentQuestion,
  selectQuizPhase,
  selectQuizResult,
  type DemoAction,
  type DemoState,
  type Route,
} from '../../lib/demo-state';

export interface PracticeViewProps {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  onNavigate?: (route: Route) => void;
}

function AnswerOption({
  question,
  index,
  selectedIndex,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  selectedIndex: number | null;
  submitted: boolean;
  onSelect: (index: number) => void;
}) {
  const selected = selectedIndex === index;
  const correct = submitted && question.correctIndex === index;
  const incorrect = submitted && selected && !correct;
  const stateClass = correct ? ' is-correct' : incorrect ? ' is-incorrect' : '';

  return (
    <label className={`practice-option${selected ? ' is-selected' : ''}${stateClass}`}>
      <input
        type="radio"
        name={`question-${question.id}`}
        value={index}
        checked={selected}
        disabled={submitted}
        onChange={() => onSelect(index)}
        data-testid={`practice-option-${index}`}
      />
      <span className="practice-option-marker" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
      <span className="practice-option-text">{question.options[index]}</span>
      {submitted && correct ? <span className="practice-option-state">正确答案</span> : null}
      {submitted && incorrect ? <span className="practice-option-state">本次选择</span> : null}
    </label>
  );
}

function PracticeResult({
  state,
  dispatch,
  onNavigate,
}: PracticeViewProps) {
  const result = selectQuizResult(state);
  const canAdd = result.missed > 0 && !state.quiz.reviewAdded;

  return (
    <section className="practice-result" data-testid="practice-result" aria-labelledby="practice-result-title">
      <div className="practice-result-icon" aria-hidden="true">{result.missed === 0 ? '✓' : '!'}</div>
      <p className="eyebrow">本轮结果 · 示例反馈</p>
      <h2 id="practice-result-title">完成 {result.total} 道练习</h2>
      <p className="practice-result-score">
        <strong>{result.score}</strong>
        <span> / {result.maxScore} 题答对</span>
      </p>
      <p className="practice-result-detail">
        {result.missed === 0
          ? '本轮没有错题，可以继续保持并在稍后复测。'
          : `有 ${result.missed} 道题需要再看一遍，加入复习队列后会保留复测记录。`}
      </p>
      <div className="practice-result-actions">
        {result.missed > 0 ? (
          <button
            type="button"
            className="button button-primary"
            disabled={!canAdd}
            onClick={() => dispatch({ type: 'add_missed_to_review' })}
            data-testid="practice-add-review"
          >
            {state.quiz.reviewAdded ? '已加入复习' : '加入复习队列'}
          </button>
        ) : null}
        {state.quiz.reviewAdded && onNavigate ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => onNavigate('review')}
            data-testid="practice-view-review"
          >
            查看复习队列
          </button>
        ) : null}
        <button
          type="button"
          className="button button-secondary"
          onClick={() => dispatch({ type: 'retry_quiz' })}
          data-testid="practice-retry"
        >
          再练一轮
        </button>
      </div>
    </section>
  );
}

export default function PracticeView({ state, dispatch, onNavigate }: PracticeViewProps) {
  if (selectQuizPhase(state) === 'complete') {
    return <PracticeResult state={state} dispatch={dispatch} onNavigate={onNavigate} />;
  }

  const question = selectCurrentQuestion(state);
  const isSubmitted = selectQuizPhase(state) === 'submitted';
  const selectedIndex = state.quiz.selectedIndex;
  const selectedCorrect = selectCurrentAnswerCorrect(state) === true;
  const isLastQuestion = state.quiz.index === QUIZ_FIXTURES.length - 1;

  return (
    <section className="practice-view" aria-labelledby="practice-title">
      <header className="view-heading practice-heading">
        <div>
          <p className="eyebrow">短练习 · 确定性反馈</p>
          <h1 id="practice-title">练习工作台</h1>
          <p className="view-description">回答一题，马上看到依据；结果只用于这次公开演示。</p>
        </div>
        <span className="demo-note">示例反馈，不连接在线模型</span>
      </header>

      <div className="practice-progress-row" aria-label={`练习进度，第 ${question.number} 题，共 ${QUIZ_FIXTURES.length} 题`}>
        <div className="practice-progress-label">
          <strong>第 {question.number} / {QUIZ_FIXTURES.length} 题</strong>
          <span>{question.category} · {question.difficulty}</span>
        </div>
        <div className="practice-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={QUIZ_FIXTURES.length} aria-valuenow={question.number}>
          <span style={{ width: `${(question.number / QUIZ_FIXTURES.length) * 100}%` }} />
        </div>
      </div>

      <article className="practice-question" data-testid="practice-question">
        <div className="practice-question-meta">
          <span className="status-pill status-pill-blue">{question.knowledgePoint}</span>
          <span className="muted-text">来源质量 · 已核验示例</span>
        </div>
        <h2>{question.prompt}</h2>

        <fieldset className="practice-options" disabled={isSubmitted}>
          <legend className="sr-only">请选择一个答案</legend>
          {question.options.map((_, index) => (
            <AnswerOption
              key={`${question.id}-${index}`}
              question={question}
              index={index}
              selectedIndex={selectedIndex}
              submitted={isSubmitted}
              onSelect={optionIndex => dispatch({ type: 'select_answer', index: optionIndex })}
            />
          ))}
        </fieldset>

        {isSubmitted ? (
          <div className={`practice-feedback ${selectedCorrect ? 'is-positive' : 'is-warning'}`} role="status" aria-live="polite">
            <div className="practice-feedback-heading">
              <strong>{selectedCorrect ? '回答正确' : '这次需要再看一遍'}</strong>
              <span>{selectedCorrect ? '已记录为一次有效练习' : `正确答案：${question.answer}`}</span>
            </div>
            <p>{question.explanation}</p>
            <span className="practice-feedback-link">关联知识区：{question.knowledgePoint}</span>
          </div>
        ) : (
          <p className="practice-hint">选择后提交，系统会给出固定的解释与关联知识区。</p>
        )}

        <footer className="practice-question-actions">
          {!isSubmitted ? (
            <button
              type="button"
              className="button button-primary"
              disabled={selectedIndex === null}
              onClick={() => dispatch({ type: 'submit_answer' })}
              data-testid="practice-submit"
            >
              提交答案
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={() => dispatch({ type: 'advance_question' })}
              data-testid="practice-next"
            >
              {isLastQuestion ? '查看本轮结果' : '下一题'}
            </button>
          )}
        </footer>
      </article>
    </section>
  );
}
