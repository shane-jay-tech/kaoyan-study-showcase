import { describe, expect, it } from 'vitest';
import * as fixtures from '../data/demo-fixtures';
import {
  PUBLIC_DEMO_LABEL,
  QUIZ_FIXTURES,
  TASK_FIXTURES,
} from '../data/demo-fixtures';
import {
  createInitialState,
  demoReducer,
  routeFromHash,
  selectCurrentAnswerCorrect,
  selectDashboardMetrics,
  selectPlanSummary,
  selectQuizPhase,
  selectQuizResult,
  selectReviewSummary,
  type DemoAction,
  type DemoState,
} from './demo-state';
import { daysUntil, formatMinutes, formatPercent } from './format';
import { EXAM_FIXTURES } from '../data/public-source-mirror';

function reduce(state: DemoState, ...actions: DemoAction[]): DemoState {
  return actions.reduce(demoReducer, state);
}

function completeQuiz(state: DemoState, correct: boolean): DemoState {
  let next = state;
  for (const question of QUIZ_FIXTURES) {
    const chosen = correct ? question.correctIndex : (question.correctIndex + 1) % question.options.length;
    next = reduce(next,
      { type: 'select_answer', index: chosen },
      { type: 'submit_answer' },
      { type: 'advance_question' },
    );
  }
  return next;
}

describe('demo state', () => {
  it('starts with a generalized, synthetic scenario', () => {
    const state = createInitialState();
    expect(state.route).toBe('today');
    expect(state.tasks).toHaveLength(TASK_FIXTURES.length);
    expect(selectDashboardMetrics(state).completedTasks).toBe(1);
    expect(selectReviewSummary(state)).toEqual({ due: 1, watch: 1, cleared: 1, active: 2 });
  });

  it('derives recent accuracy from synthetic sessions, not a magic constant', () => {
    const state = createInitialState();
    expect(selectDashboardMetrics(state).accuracy).toBe(88);
    // accuracy stays stable across quiz sessions (it is a historical fixture metric)
    const afterWrongQuiz = completeQuiz(state, false);
    expect(selectDashboardMetrics(afterWrongQuiz).accuracy).toBe(88);
  });

  it('updates task completion and derives minutes', () => {
    const state = createInitialState();
    const next = demoReducer(state, { type: 'complete_task', id: 'task-method-01' });
    expect(next.tasks.find(task => task.id === 'task-method-01')?.status).toBe('done');
    expect(selectDashboardMetrics(next).completedMinutes).toBe(65);
    expect(selectPlanSummary(next).remainingMinutes).toBe(110);
    expect(selectPlanSummary(next).capacityMinutes).toBe(240);
  });

  it('ignores invalid task and answer transitions', () => {
    const state = createInitialState();
    expect(demoReducer(state, { type: 'complete_task', id: 'missing' })).toBe(state);
    expect(demoReducer(state, { type: 'complete_task', id: 'task-review-05' })).toBe(state);
    expect(demoReducer(state, { type: 'select_answer', index: -1 })).toBe(state);
    expect(demoReducer(state, { type: 'select_answer', index: 99 })).toBe(state);
    expect(demoReducer(state, { type: 'submit_answer' })).toBe(state);
  });

  it('defers a task with an explicit reason and rejects invalid deferrals', () => {
    const state = createInitialState();
    const next = demoReducer(state, { type: 'defer_task', id: 'task-reading-02', reason: '时间冲突，需调整时段' });
    const item = next.tasks.find(task => task.id === 'task-reading-02');
    expect(item?.status).toBe('deferred');
    expect(item?.deferReason).toBe('时间冲突，需调整时段');
    expect(selectPlanSummary(next).deferredCount).toBe(2);
    // no-op: unknown id, empty reason, or already-deferred task
    expect(demoReducer(next, { type: 'defer_task', id: 'missing', reason: '任意' })).toBe(next);
    expect(demoReducer(state, { type: 'defer_task', id: 'task-reading-02', reason: '   ' })).toBe(state);
    expect(demoReducer(next, { type: 'defer_task', id: 'task-reading-02', reason: '再延一次' })).toBe(next);
  });

  it('scores a complete quiz deterministically', () => {
    const result = selectQuizResult(completeQuiz(createInitialState(), true));
    expect(result.complete).toBe(true);
    expect(result.score).toBe(QUIZ_FIXTURES.length);
    expect(result.missed).toBe(0);
  });

  it('rejects submitting an unanswered question and advancing before feedback', () => {
    const state = createInitialState();
    expect(demoReducer(state, { type: 'advance_question' })).toBe(state);
    const answered = demoReducer(state, { type: 'select_answer', index: 0 });
    expect(demoReducer(answered, { type: 'advance_question' })).toBe(answered);
    expect(selectQuizPhase(state)).toBe('ready');
    expect(selectCurrentAnswerCorrect(answered)).toBeNull();
  });

  it('exposes submitted phase and deterministic answer correctness', () => {
    const state = createInitialState();
    const answered = demoReducer(state, { type: 'select_answer', index: 1 });
    const submitted = demoReducer(answered, { type: 'submit_answer' });
    expect(selectQuizPhase(submitted)).toBe('submitted');
    expect(selectCurrentAnswerCorrect(submitted)).toBe(true);
    const wrong = demoReducer(state, { type: 'select_answer', index: 0 });
    expect(selectCurrentAnswerCorrect(demoReducer(wrong, { type: 'submit_answer' }))).toBe(false);
  });

  it('retry_quiz starts a fresh session from any phase', () => {
    const fresh = demoReducer(createInitialState(), { type: 'retry_quiz' });
    expect(fresh.quiz.index).toBe(0);
    expect(fresh.quiz.submitted).toBe(false);
    expect(fresh.quiz.complete).toBe(false);
    expect(fresh.quiz.score).toBe(0);

    const done = completeQuiz(createInitialState(), false);
    expect(done.quiz.complete).toBe(true);
    const retried = demoReducer(done, { type: 'retry_quiz' });
    expect(retried.quiz.complete).toBe(false);
    expect(retried.quiz.answers.every(answer => answer === null)).toBe(true);
  });

  it('adds one review item per missed question, exactly once', () => {
    const state = completeQuiz(createInitialState(), false);
    expect(selectQuizResult(state).missed).toBe(QUIZ_FIXTURES.length);

    const next = demoReducer(state, { type: 'add_missed_to_review' });
    expect(next.quiz.reviewAdded).toBe(true);
    const added = next.reviewItems.filter(item => item.id.startsWith('review-quiz-'));
    expect(added).toHaveLength(QUIZ_FIXTURES.length);
    for (const item of added) {
      expect(item.status).toBe('due');
      expect(item.stage).toBe(0);
      expect(item.reason).toContain('练习答错');
    }
    // once-only: a second dispatch must not duplicate or change anything
    expect(demoReducer(next, { type: 'add_missed_to_review' })).toBe(next);
  });

  it('cannot add to review when nothing was missed', () => {
    const state = completeQuiz(createInitialState(), true);
    expect(selectQuizResult(state).missed).toBe(0);
    expect(demoReducer(state, { type: 'add_missed_to_review' })).toBe(state);
  });

  it('marks repeated missed-item review as handled without duplicating items', () => {
    const firstRound = completeQuiz(createInitialState(), false);
    const added = demoReducer(firstRound, { type: 'add_missed_to_review' });
    const secondRound = completeQuiz(demoReducer(added, { type: 'retry_quiz' }), false);
    const handled = demoReducer(secondRound, { type: 'add_missed_to_review' });
    expect(handled.quiz.reviewAdded).toBe(true);
    expect(handled.reviewItems).toHaveLength(added.reviewItems.length);
    expect(handled.reviewItems).toEqual(added.reviewItems);
  });

  it('requires two correct retests before closing an item', () => {
    const state = createInitialState();
    const first = demoReducer(state, { type: 'retest_review', id: 'review-01', correct: true });
    expect(first.reviewItems.find(item => item.id === 'review-01')?.status).toBe('watch');
    expect(first.reviewItems.find(item => item.id === 'review-01')?.stage).toBe(1);
    const second = demoReducer(first, { type: 'retest_review', id: 'review-01', correct: true });
    expect(second.reviewItems.find(item => item.id === 'review-01')?.status).toBe('cleared');
    expect(second.reviewItems.find(item => item.id === 'review-01')?.stage).toBe(2);
  });

  it('returns an item to due after an incorrect retest', () => {
    const state = createInitialState();
    const next = demoReducer(state, { type: 'retest_review', id: 'review-02', correct: false });
    const item = next.reviewItems.find(review => review.id === 'review-02');
    expect(item?.status).toBe('due');
    expect(item?.stage).toBe(0);
    expect(item?.attempts).toBe(3);
  });

  it('never reopens a cleared item', () => {
    const state = createInitialState();
    const cleared = state.reviewItems.find(item => item.id === 'review-03');
    expect(cleared?.status).toBe('cleared');
    expect(demoReducer(state, { type: 'retest_review', id: 'review-03', correct: true })).toBe(state);
    expect(demoReducer(state, { type: 'retest_review', id: 'review-03', correct: false })).toBe(state);
    expect(demoReducer(state, { type: 'retest_review', id: 'missing', correct: true })).toBe(state);
  });

  it('updates review confidence and rejects invalid targets or levels', () => {
    const state = createInitialState();
    const updated = demoReducer(state, { type: 'set_review_confidence', id: 'review-01', confidence: 5 });
    expect(updated.reviewItems.find(item => item.id === 'review-01')?.confidence).toBe(5);
    expect(demoReducer(updated, { type: 'set_review_confidence', id: 'review-01', confidence: 0 })).toBe(updated);
    expect(demoReducer(updated, { type: 'set_review_confidence', id: 'review-01', confidence: 6 })).toBe(updated);
    expect(demoReducer(updated, { type: 'set_review_confidence', id: 'missing', confidence: 3 })).toBe(updated);
  });

  it('resets every mutable value', () => {
    let state = createInitialState();
    state = reduce(state,
      { type: 'complete_task', id: 'task-method-01' },
      { type: 'select_answer', index: 0 },
      { type: 'submit_answer' },
      { type: 'navigate', route: 'practice' },
    );
    const reset = demoReducer(state, { type: 'reset_demo' });
    expect(reset).toEqual(createInitialState());
    // reset returns a fresh deep clone, not shared fixture references
    expect(reset.tasks).not.toBe(createInitialState().tasks);
    expect(reset.tasks[0]).not.toBe(TASK_FIXTURES[0]);
  });

  it('normalizes unknown hashes to today', () => {
    expect(routeFromHash('#/practice')).toBe('practice');
    expect(routeFromHash('#/case-study?from=home')).toBe('case-study');
    expect(routeFromHash('#/private')).toBe('today');
    expect(routeFromHash('')).toBe('today');
  });
});

describe('fixture generalization', () => {
  it('exports the required public demo label', () => {
    expect(PUBLIC_DEMO_LABEL).toBe('公开镜像 · 脱敏演示');
  });

  it('contains no prohibited identifiers, paths, or secrets', () => {
    const text = JSON.stringify(fixtures);
    const denylist = [
      /[A-Za-z]:[\\/]/,                       // absolute Windows paths
      /https?:\/\//,                          // URLs / endpoints
      /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/,         // emails
      /1[3-9]\d{9}/,                          // mainland phone numbers
      /(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16})/, // known secret shapes
      /(api[_-]?key|password|passwd|connection[_-]?string|BEGIN [A-Z ]+PRIVATE KEY)/i,
    ];
    for (const pattern of denylist) {
      expect(text).not.toMatch(pattern);
    }
  });

  it('keeps the fictional exam date parseable and in the future', () => {
    expect(fixtures.DEMO_TRACK.examDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(daysUntil(fixtures.DEMO_TRACK.examDate, '2026-08-30')).toBeGreaterThan(0);
  });

  it('has three original questions with unique ids and valid answer keys', () => {
    expect(QUIZ_FIXTURES).toHaveLength(3);
    const ids = new Set(QUIZ_FIXTURES.map(question => question.id));
    expect(ids.size).toBe(QUIZ_FIXTURES.length);
    for (const question of QUIZ_FIXTURES) {
      expect(question.options).toHaveLength(4);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
      expect(question.explanation.length).toBeGreaterThan(0);
    }
  });

  it('keeps fixture ids unique across tasks and review items', () => {
    const taskIds = new Set(TASK_FIXTURES.map(task => task.id));
    expect(taskIds.size).toBe(TASK_FIXTURES.length);
    const reviewIds = new Set(fixtures.REVIEW_FIXTURES.map(item => item.id));
    expect(reviewIds.size).toBe(fixtures.REVIEW_FIXTURES.length);
  });

  it('seeds one due, one watch, and one cleared review item', () => {
    const statuses = fixtures.REVIEW_FIXTURES.map(item => item.status);
    expect(statuses).toContain('due');
    expect(statuses).toContain('watch');
    expect(statuses).toContain('cleared');
  });
});

describe('extended mirror workflows', () => {
  it('restores a draft at its next unanswered question and keeps counts honest', () => {
    let state = createInitialState();
    state = demoReducer(state, { type: 'start_exam', id: 'exam-sprint-01' });
    expect(state.exam.phase).toBe('draft');
    expect(state.exam.answered).toBe(EXAM_FIXTURES[0].answered);
    expect(state.exam.currentIndex).toBe(EXAM_FIXTURES[0].answered);

    state = demoReducer(state, { type: 'answer_exam', index: state.exam.currentIndex });
    expect(state.exam.answered).toBe(8);
    state = demoReducer(state, { type: 'advance_exam' });
    expect(state.exam.currentIndex).toBe(8);
    expect(state.exam.answered).toBe(8);
  });

  it('opens a finished exam as a result and rejects invalid exam transitions', () => {
    const initial = createInitialState();
    const finished = demoReducer(initial, { type: 'start_exam', id: 'exam-weekly-02' });
    expect(finished.exam.phase).toBe('submitted');
    expect(finished.exam.answered).toBe(12);
    expect(demoReducer(initial, { type: 'start_exam', id: 'missing' })).toBe(initial);
    expect(demoReducer(finished, { type: 'answer_exam', index: 0 })).toBe(finished);
  });

  it('separates expression editing from a saved revision', () => {
    const initial = createInitialState();
    const initialRevision = initial.expression.revisions['expression-01'];
    const edited = demoReducer(initial, { type: 'edit_expression_draft', id: 'expression-01', draft: '新的结构草稿' });
    expect(edited.expression.drafts['expression-01']).toBe('新的结构草稿');
    expect(edited.expression.revisions['expression-01']).toBe(initialRevision);
    const saved = demoReducer(edited, { type: 'save_expression_revision', id: 'expression-01', draft: '新的结构草稿' });
    expect(saved.expression.revisions['expression-01']).toBe(initialRevision + 1);
  });

  it('keeps extended actions idempotent for unknown records', () => {
    const initial = createInitialState();
    expect(demoReducer(initial, { type: 'set_study_status', id: 'missing', status: 'mastered' })).toBe(initial);
    expect(demoReducer(initial, { type: 'resolve_wrong_question', id: 'missing' })).toBe(initial);
    expect(demoReducer(initial, { type: 'approve_content', id: 'missing' })).toBe(initial);
    expect(demoReducer(initial, { type: 'select_expression', id: 'missing' })).toBe(initial);
  });
});

describe('format helpers', () => {
  it('formats minutes and percent', () => {
    expect(formatMinutes(45)).toBe('45 分钟');
    expect(formatMinutes(90)).toBe('1 小时 30 分钟');
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(88)).toBe('88%');
  });

  it('computes whole calendar days between dates', () => {
    expect(daysUntil('2027-01-01', '2026-12-25')).toBe(7);
    expect(daysUntil('2026-12-31', '2026-12-25')).toBe(6);
  });

  it('never returns a negative countdown for past dates', () => {
    expect(daysUntil('2026-01-01', '2026-08-30')).toBe(0);
  });
});
