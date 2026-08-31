import {
  ACTIVITY_FIXTURES,
  DAILY_CAPACITY_MINUTES,
  DEMO_TRACK,
  QUIZ_FIXTURES,
  RECENT_SESSIONS,
  RECOMMENDATION,
  REVIEW_FIXTURES,
  TASK_FIXTURES,
  type DemoTask,
  type QuizQuestion,
  type ReviewItem,
  type ReviewStatus,
  type TaskStatus,
} from '../data/demo-fixtures';
import { daysUntil } from './format';

export type Route = 'today' | 'plan' | 'practice' | 'review' | 'insights' | 'case-study';

export const ROUTES: readonly Route[] = [
  'today',
  'plan',
  'practice',
  'review',
  'insights',
  'case-study',
];

export interface QuizState {
  index: number;
  selectedIndex: number | null;
  answers: Array<number | null>;
  submitted: boolean;
  complete: boolean;
  score: number;
  reviewAdded: boolean;
}

export type QuizPhase = 'ready' | 'submitted' | 'complete';

export interface DemoState {
  route: Route;
  tasks: DemoTask[];
  reviewItems: ReviewItem[];
  quiz: QuizState;
}

export type DemoAction =
  | { type: 'navigate'; route: Route }
  | { type: 'complete_task'; id: string }
  | { type: 'defer_task'; id: string; reason: string }
  | { type: 'select_answer'; index: number }
  | { type: 'submit_answer' }
  | { type: 'advance_question' }
  | { type: 'retry_quiz' }
  | { type: 'add_missed_to_review' }
  | { type: 'retest_review'; id: string; correct: boolean }
  | { type: 'set_review_confidence'; id: string; confidence: number }
  | { type: 'reset_demo' };

export interface DashboardMetrics {
  plannedMinutes: number;
  completedMinutes: number;
  completedTasks: number;
  totalTasks: number;
  reviewLoad: number;
  accuracy: number;
  completionPercent: number;
}

export interface PlanSummary {
  capacityMinutes: number;
  scheduledMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  utilizationPercent: number;
  deferredCount: number;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  answered: number;
  total: number;
  missed: number;
  complete: boolean;
}

export interface ReviewSummary {
  due: number;
  watch: number;
  cleared: number;
  active: number;
}

export const INITIAL_STATE = createInitialState();

export function createInitialState(): DemoState {
  return {
    route: 'today',
    tasks: TASK_FIXTURES.map(task => ({ ...task })),
    reviewItems: REVIEW_FIXTURES.map(item => ({ ...item })),
    quiz: {
      index: 0,
      selectedIndex: null,
      answers: QUIZ_FIXTURES.map(() => null),
      submitted: false,
      complete: false,
      score: 0,
      reviewAdded: false,
    },
  };
}

/** Domain-named alias for consumers that do not need the shorter legacy name. */
export const createInitialDemoState = createInitialState;

function updateTaskStatus(tasks: DemoTask[], id: string, status: TaskStatus): DemoTask[] {
  const current = tasks.find(task => task.id === id);
  if (!current || current.status === status) return tasks;
  return tasks.map(task => task.id === id ? { ...task, status } : task);
}

function completeTask(tasks: DemoTask[], id: string): DemoTask[] {
  const current = tasks.find(task => task.id === id);
  if (!current || current.status === 'done' || current.status === 'deferred') return tasks;
  return updateTaskStatus(tasks, id, 'done');
}

function calculateScore(answers: Array<number | null>): number {
  return answers.reduce<number>((score, answer, index) => (
    answer === QUIZ_FIXTURES[index]?.correctIndex ? score + 1 : score
  ), 0);
}

function updateReviewItem(
  items: ReviewItem[],
  id: string,
  updater: (item: ReviewItem) => ReviewItem,
): ReviewItem[] {
  const current = items.find(item => item.id === id);
  if (!current) return items;
  const next = updater(current);
  if (next === current) return items;
  return items.map(item => item.id === id ? next : item);
}

function retestReviewItem(item: ReviewItem, correct: boolean): ReviewItem {
  // A cleared item (two independent correct retests) is terminal: no retest may reopen it.
  if (item.status === 'cleared') return item;
  if (correct && item.stage === 0) {
    return {
      ...item,
      stage: 1,
      status: 'watch',
      attempts: item.attempts + 1,
      lastResult: '通过一轮',
      dueLabel: '下一轮待观察',
    };
  }
  if (correct && item.stage === 1) {
    return {
      ...item,
      stage: 2,
      status: 'cleared',
      attempts: item.attempts + 1,
      lastResult: '已关闭',
      dueLabel: '已关闭',
      confidence: Math.max(item.confidence, 4),
    };
  }
  return {
    ...item,
    stage: 0,
    status: 'due',
    attempts: item.attempts + 1,
    lastResult: '需重练',
    dueLabel: '重新安排',
    confidence: Math.max(1, item.confidence - 1),
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'navigate':
      return ROUTES.includes(action.route) ? { ...state, route: action.route } : state;

    case 'complete_task': {
      const tasks = completeTask(state.tasks, action.id);
      return tasks === state.tasks ? state : { ...state, tasks };
    }

    case 'defer_task': {
      const current = state.tasks.find(task => task.id === action.id);
      if (!current || current.status === 'deferred' || current.status === 'done') return state;
      if (typeof action.reason !== 'string') return state;
      const reason = action.reason.trim();
      if (!reason) return state;
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === action.id
          ? { ...task, status: 'deferred', deferReason: reason }
          : task),
      };
    }

    case 'select_answer':
      if (
        state.quiz.complete
        || state.quiz.submitted
        || !Number.isInteger(action.index)
        || action.index < 0
        || action.index >= (QUIZ_FIXTURES[state.quiz.index]?.options.length ?? 0)
      ) return state;
      return { ...state, quiz: { ...state.quiz, selectedIndex: action.index } };

    case 'submit_answer': {
      if (state.quiz.complete || state.quiz.submitted || state.quiz.selectedIndex === null) return state;
      const answers = state.quiz.answers.map((answer, index) => (
        index === state.quiz.index ? state.quiz.selectedIndex : answer
      ));
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answers,
          submitted: true,
          score: calculateScore(answers),
        },
      };
    }

    case 'advance_question':
      if (!state.quiz.submitted) return state;
      if (state.quiz.index >= QUIZ_FIXTURES.length - 1) {
        return { ...state, quiz: { ...state.quiz, complete: true } };
      }
      return {
        ...state,
        quiz: {
          ...state.quiz,
          index: state.quiz.index + 1,
          selectedIndex: null,
          submitted: false,
        },
      };

    case 'retry_quiz':
      // Starts a fresh session from any quiz phase (ready, submitted, complete).
      return {
        ...state,
        quiz: {
          index: 0,
          selectedIndex: null,
          answers: QUIZ_FIXTURES.map(() => null),
          submitted: false,
          complete: false,
          score: 0,
          reviewAdded: false,
        },
      };

    case 'add_missed_to_review': {
      if (!state.quiz.complete || state.quiz.reviewAdded || state.quiz.score === QUIZ_FIXTURES.length) return state;
      const existingIds = new Set(state.reviewItems.map(item => item.id));
      const additions: ReviewItem[] = [];
      for (const question of QUIZ_FIXTURES) {
        const answer = state.quiz.answers[QUIZ_FIXTURES.indexOf(question)];
        if (answer === null || answer === question.correctIndex) continue;
        const reviewId = `review-${question.id}`;
        if (existingIds.has(reviewId)) continue;
        additions.push({
          id: reviewId,
          title: question.knowledgePoint,
          subject: question.category,
          reason: '练习答错，自动加入复习队列',
          stage: 0,
          status: 'due',
          dueLabel: '今天到期',
          confidence: 2,
          attempts: 0,
          lastResult: '待复测',
        });
        existingIds.add(reviewId);
      }
      if (additions.length === 0) {
        return {
          ...state,
          quiz: { ...state.quiz, reviewAdded: true },
        };
      }
      return {
        ...state,
        quiz: { ...state.quiz, reviewAdded: true },
        reviewItems: [...state.reviewItems, ...additions],
      };
    }

    case 'retest_review': {
      if (typeof action.correct !== 'boolean') return state;
      const reviewItems = updateReviewItem(state.reviewItems, action.id, item => retestReviewItem(item, action.correct));
      return reviewItems === state.reviewItems ? state : { ...state, reviewItems };
    }

    case 'set_review_confidence': {
      if (!Number.isInteger(action.confidence) || action.confidence < 1 || action.confidence > 5) return state;
      const items = updateReviewItem(state.reviewItems, action.id, item => ({ ...item, confidence: action.confidence }));
      // Unknown target id is an invalid transition: keep the exact state object.
      return items === state.reviewItems ? state : { ...state, reviewItems: items };
    }

    case 'reset_demo':
      return createInitialState();

    default:
      return state;
  }
}

export function routeFromHash(hash: string): Route {
  const candidate = hash.replace(/^#\/?/, '').split('?')[0] as Route;
  return ROUTES.includes(candidate) ? candidate : 'today';
}

export function hashForRoute(route: Route): string {
  return `#/${route}`;
}

export function selectDashboardMetrics(state: DemoState): DashboardMetrics {
  const plannedMinutes = state.tasks
    .filter(task => task.status !== 'deferred')
    .reduce((total, task) => total + task.durationMinutes, 0);
  const completedMinutes = state.tasks
    .filter(task => task.status === 'done')
    .reduce((total, task) => total + task.durationMinutes, 0);
  const completedTasks = state.tasks.filter(task => task.status === 'done').length;
  const reviewLoad = state.reviewItems.filter(item => item.status !== 'cleared').length;
  const recentTotal = RECENT_SESSIONS.reduce((total, session) => total + session.total, 0);
  const recentCorrect = RECENT_SESSIONS.reduce((total, session) => total + session.correct, 0);
  const accuracy = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : 0;
  return {
    plannedMinutes,
    completedMinutes,
    completedTasks,
    totalTasks: state.tasks.length,
    reviewLoad,
    accuracy,
    completionPercent: plannedMinutes ? Math.round((completedMinutes / plannedMinutes) * 100) : 0,
  };
}

export function selectNextAction(state: DemoState): { label: string; detail: string; route: Route } {
  const activeTask = state.tasks.find(task => task.status === 'in_progress' || task.status === 'todo');
  if (activeTask) {
    return {
      label: activeTask.title,
      detail: `${activeTask.durationMinutes} 分钟 · ${activeTask.evidence}`,
      route: activeTask.subject === '方法基础' ? 'practice' : 'plan',
    };
  }
  const dueReview = state.reviewItems.find(item => item.status === 'due');
  if (dueReview) return { label: `复测：${dueReview.title}`, detail: dueReview.dueLabel, route: 'review' };
  return { label: '查看阶段洞察', detail: '本周证据已整理完成', route: 'insights' };
}

export function selectPlanSummary(state: DemoState): PlanSummary {
  const metrics = selectDashboardMetrics(state);
  const capacityMinutes = DAILY_CAPACITY_MINUTES;
  const scheduledMinutes = state.tasks
    .filter(task => task.status !== 'deferred')
    .reduce((total, task) => total + task.durationMinutes, 0);
  return {
    capacityMinutes,
    scheduledMinutes,
    completedMinutes: metrics.completedMinutes,
    remainingMinutes: Math.max(0, scheduledMinutes - metrics.completedMinutes),
    utilizationPercent: Math.min(100, Math.round((scheduledMinutes / capacityMinutes) * 100)),
    deferredCount: state.tasks.filter(task => task.status === 'deferred').length,
  };
}

export interface PlanGroups {
  上午: DemoTask[];
  下午: DemoTask[];
  晚上: DemoTask[];
}

export function selectPlanGroups(state: DemoState): PlanGroups {
  const groups: PlanGroups = { 上午: [], 下午: [], 晚上: [] };
  for (const task of state.tasks) {
    groups[task.slot].push(task);
  }
  return groups;
}

export function selectRecommendation() {
  return RECOMMENDATION;
}

export function selectQuizResult(state: DemoState): QuizResult {
  const answered = state.quiz.answers.filter(answer => answer !== null).length;
  const missed = state.quiz.answers.reduce<number>((count, answer, index) => (
    answer !== null && answer !== QUIZ_FIXTURES[index]?.correctIndex ? count + 1 : count
  ), 0);
  return {
    score: state.quiz.score,
    maxScore: QUIZ_FIXTURES.length,
    answered,
    total: QUIZ_FIXTURES.length,
    missed,
    complete: state.quiz.complete,
  };
}

export function selectReviewSummary(state: DemoState): ReviewSummary {
  return state.reviewItems.reduce<ReviewSummary>((summary, item) => {
    summary[item.status] += 1;
    if (item.status !== 'cleared') summary.active += 1;
    return summary;
  }, { due: 0, watch: 0, cleared: 0, active: 0 });
}

export function selectQuizPhase(state: DemoState): QuizPhase {
  if (state.quiz.complete) return 'complete';
  if (state.quiz.submitted) return 'submitted';
  return 'ready';
}

export function selectCurrentQuestion(state: DemoState): QuizQuestion {
  return QUIZ_FIXTURES[state.quiz.index] ?? QUIZ_FIXTURES[0];
}

export function selectCurrentAnswerCorrect(state: DemoState): boolean | null {
  if (!state.quiz.submitted) return null;
  return state.quiz.selectedIndex === selectCurrentQuestion(state).correctIndex;
}

export function selectTodayTasks(state: DemoState): DemoTask[] {
  return state.tasks.filter(task => task.status !== 'deferred').slice(0, 4);
}

export function selectActivity() {
  return ACTIVITY_FIXTURES;
}

export function selectTrack() {
  return DEMO_TRACK;
}

/** Days until the fictional exam date, derived from the fixture date (never duplicated). */
export function selectDaysRemaining(): number {
  return daysUntil(DEMO_TRACK.examDate);
}

export function selectReviewItem(state: DemoState, id: string): ReviewItem | undefined {
  return state.reviewItems.find(item => item.id === id);
}

export function selectActiveReviewItems(state: DemoState): ReviewItem[] {
  return state.reviewItems.filter(item => item.status !== 'cleared');
}

export function selectClearedReviewItems(state: DemoState): ReviewItem[] {
  return state.reviewItems.filter(item => item.status === 'cleared');
}

export function selectStatusLabel(status: ReviewStatus): string {
  return status === 'due' ? '待复测' : status === 'watch' ? '观察中' : '已关闭';
}
