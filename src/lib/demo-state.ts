import {
  ACTIVITY_FIXTURES,
  CONTENT_REVIEW_ITEMS,
  DAILY_CAPACITY_MINUTES,
  EXAM_FIXTURES,
  EXPRESSION_FIXTURES,
  KNOWLEDGE_POINTS,
  MIRROR_PROFILE,
  QUIZ_FIXTURES,
  RECENT_SESSIONS,
  RECOMMENDATION,
  REVIEW_FIXTURES,
  STUDY_CHAPTERS,
  TASK_FIXTURES,
  WRONG_QUESTION_FIXTURES,
  type DemoTask,
  type QuizQuestion,
  type ReviewItem,
  type ReviewStatus,
  type TaskStatus,
} from '../data/public-source-mirror';
import { daysUntil } from './format';

export type Route =
  | 'today'
  | 'plan'
  | 'study'
  | 'study-professional'
  | 'study-language'
  | 'study-foundation'
  | 'practice'
  | 'past-exams'
  | 'exam'
  | 'review'
  | 'wrong-questions'
  | 'expression'
  | 'analytics'
  | 'diagnosis'
  | 'system'
  | 'content-review'
  | 'case-study';

export const ROUTES: readonly Route[] = [
  'today', 'plan', 'study', 'study-professional', 'study-language', 'study-foundation',
  'practice', 'past-exams', 'exam', 'review', 'wrong-questions', 'expression',
  'analytics', 'diagnosis', 'system', 'content-review', 'case-study',
];

export interface QuizState {
  index: number;
  selectedIndex: number | null;
  answers: Array<number | null>;
  submitted: boolean;
  complete: boolean;
  score: number;
  reviewAdded: boolean;
  mode: 'single' | 'multi' | 'short';
  started: boolean;
}

export type QuizPhase = 'ready' | 'submitted' | 'complete';
export type KnowledgeStatus = 'unseen' | 'learning' | 'review' | 'mastered';

export interface ExamDemoState {
  selectedId: string;
  phase: 'idle' | 'draft' | 'submitted';
  currentIndex: number;
  answered: number;
}

export interface ExpressionDemoState {
  selectedId: string;
  drafts: Record<string, string>;
  accepted: string[];
  revisions: Record<string, number>;
}

export interface DemoState {
  route: Route;
  tasks: DemoTask[];
  reviewItems: ReviewItem[];
  quiz: QuizState;
  studyStatuses: Record<string, KnowledgeStatus>;
  wrongResolved: string[];
  expression: ExpressionDemoState;
  exam: ExamDemoState;
  diagnosisStep: number;
  contentStatuses: Record<string, string>;
  backupCreated: boolean;
  profile: {
    targetScore: number;
    dailyMinutes: number;
    cardCapacity: number;
    vocabularyCapacity: number;
  };
}

export type DemoAction =
  | { type: 'navigate'; route: Route }
  | { type: 'start_task'; id: string }
  | { type: 'complete_task'; id: string }
  | { type: 'defer_task'; id: string; reason: string }
  | { type: 'set_study_status'; id: string; status: KnowledgeStatus }
  | { type: 'select_answer'; index: number }
  | { type: 'submit_answer' }
  | { type: 'advance_question' }
  | { type: 'retry_quiz' }
  | { type: 'start_practice'; mode?: QuizState['mode'] }
  | { type: 'add_missed_to_review' }
  | { type: 'retest_review'; id: string; correct: boolean }
  | { type: 'set_review_confidence'; id: string; confidence: number }
  | { type: 'resolve_wrong_question'; id: string }
  | { type: 'select_expression'; id: string }
  | { type: 'edit_expression_draft'; id: string; draft: string }
  | { type: 'save_expression_revision'; id: string; draft: string }
  | { type: 'accept_expression'; id: string }
  | { type: 'start_exam'; id: string }
  | { type: 'answer_exam'; index: number }
  | { type: 'advance_exam' }
  | { type: 'submit_exam' }
  | { type: 'reset_exam' }
  | { type: 'advance_diagnosis' }
  | { type: 'approve_content'; id: string }
  | { type: 'create_backup' }
  | { type: 'update_profile'; targetScore: number; dailyMinutes: number; cardCapacity: number; vocabularyCapacity: number }
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
  evidenceCount: number;
  startedCount: number;
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
      mode: 'single',
      started: false,
    },
    studyStatuses: Object.fromEntries(KNOWLEDGE_POINTS.map(point => [point.id, point.status])),
    wrongResolved: [],
    expression: {
      selectedId: EXPRESSION_FIXTURES[0].id,
      drafts: Object.fromEntries(EXPRESSION_FIXTURES.map(item => [item.id, item.draft])),
      accepted: EXPRESSION_FIXTURES.filter(item => item.status === 'accepted').map(item => item.id),
      revisions: Object.fromEntries(EXPRESSION_FIXTURES.map(item => [item.id, item.revisions])),
    },
    exam: { selectedId: 'exam-sprint-01', phase: 'idle', currentIndex: 0, answered: 7 },
    diagnosisStep: 1,
    contentStatuses: Object.fromEntries(CONTENT_REVIEW_ITEMS.map(item => [item.id, item.status])),
    backupCreated: false,
    profile: {
      targetScore: MIRROR_PROFILE.targetScore,
      dailyMinutes: MIRROR_PROFILE.dailyMinutes,
      cardCapacity: MIRROR_PROFILE.cardCapacity,
      vocabularyCapacity: MIRROR_PROFILE.vocabularyCapacity,
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
  items: ReviewItem[], id: string, updater: (item: ReviewItem) => ReviewItem,
): ReviewItem[] {
  const current = items.find(item => item.id === id);
  if (!current) return items;
  const next = updater(current);
  if (next === current) return items;
  return items.map(item => item.id === id ? next : item);
}

function retestReviewItem(item: ReviewItem, correct: boolean): ReviewItem {
  if (item.status === 'cleared') return item;
  if (correct && item.stage === 0) {
    return { ...item, stage: 1, status: 'watch', attempts: item.attempts + 1, lastResult: '通过一轮', dueLabel: '下一轮待观察', intervalLabel: '间隔 2 天' };
  }
  if (correct && item.stage === 1) {
    return { ...item, stage: 2, status: 'cleared', attempts: item.attempts + 1, lastResult: '已关闭', dueLabel: '已关闭', confidence: Math.max(item.confidence, 4), intervalLabel: '已完成' };
  }
  return { ...item, stage: 0, status: 'due', attempts: item.attempts + 1, lastResult: '需重练', dueLabel: '重新安排', confidence: Math.max(1, item.confidence - 1), intervalLabel: '间隔 1 天' };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'navigate':
      return ROUTES.includes(action.route) ? { ...state, route: action.route } : state;

    case 'start_task': {
      const current = state.tasks.find(task => task.id === action.id);
      if (!current || current.status !== 'todo') return state;
      const tasks = updateTaskStatus(state.tasks, action.id, 'in_progress');
      return tasks === state.tasks ? state : { ...state, tasks };
    }

    case 'complete_task': {
      const tasks = completeTask(state.tasks, action.id);
      return tasks === state.tasks ? state : { ...state, tasks };
    }

    case 'defer_task': {
      const current = state.tasks.find(task => task.id === action.id);
      if (!current || current.status === 'deferred' || current.status === 'done') return state;
      if (typeof action.reason !== 'string' || !action.reason.trim()) return state;
      const reason = action.reason.trim();
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === action.id ? { ...task, status: 'deferred', deferReason: reason } : task),
      };
    }

    case 'set_study_status': {
      if (!KNOWLEDGE_POINTS.some(point => point.id === action.id)) return state;
      if (!['unseen', 'learning', 'review', 'mastered'].includes(action.status)) return state;
      if (state.studyStatuses[action.id] === action.status) return state;
      return { ...state, studyStatuses: { ...state.studyStatuses, [action.id]: action.status } };
    }

    case 'start_practice':
      return {
        ...state,
        quiz: {
          ...state.quiz, index: 0, selectedIndex: null,
          answers: QUIZ_FIXTURES.map(() => null), submitted: false, complete: false,
          score: 0, reviewAdded: false, mode: action.mode || 'single', started: true,
        },
      };

    case 'select_answer':
      if (state.quiz.complete || state.quiz.submitted || !Number.isInteger(action.index)
        || action.index < 0 || action.index >= (QUIZ_FIXTURES[state.quiz.index]?.options.length ?? 0)) return state;
      return { ...state, quiz: { ...state.quiz, selectedIndex: action.index, started: true } };

    case 'submit_answer': {
      if (state.quiz.complete || state.quiz.submitted || state.quiz.selectedIndex === null) return state;
      const answers = state.quiz.answers.map((answer, index) => index === state.quiz.index ? state.quiz.selectedIndex : answer);
      return { ...state, quiz: { ...state.quiz, answers, submitted: true, started: true, score: calculateScore(answers) } };
    }

    case 'advance_question':
      if (!state.quiz.submitted) return state;
      if (state.quiz.index >= QUIZ_FIXTURES.length - 1) return { ...state, quiz: { ...state.quiz, complete: true } };
      return { ...state, quiz: { ...state.quiz, index: state.quiz.index + 1, selectedIndex: null, submitted: false } };

    case 'retry_quiz':
      return { ...state, quiz: { ...state.quiz, index: 0, selectedIndex: null, answers: QUIZ_FIXTURES.map(() => null), submitted: false, complete: false, score: 0, reviewAdded: false, started: true } };

    case 'add_missed_to_review': {
      if (!state.quiz.complete || state.quiz.reviewAdded || state.quiz.score === QUIZ_FIXTURES.length) return state;
      const existingIds = new Set(state.reviewItems.map(item => item.id));
      const additions: ReviewItem[] = [];
      QUIZ_FIXTURES.forEach((question, index) => {
        const answer = state.quiz.answers[index];
        if (answer === null || answer === question.correctIndex) return;
        const reviewId = `review-${question.id}`;
        if (existingIds.has(reviewId)) return;
        additions.push({
          id: reviewId, title: question.knowledgePoint, subject: question.category,
          reason: '练习答错，自动加入复习队列', stage: 0, status: 'due', dueLabel: '今天到期',
          confidence: 2, attempts: 0, lastResult: '待复测', cardType: 'knowledge',
          chapter: question.knowledgePoint.split(' · ')[0] || '综合训练', intervalLabel: '间隔 1 天',
        });
        existingIds.add(reviewId);
      });
      return { ...state, quiz: { ...state.quiz, reviewAdded: true }, reviewItems: additions.length ? [...state.reviewItems, ...additions] : state.reviewItems };
    }

    case 'retest_review': {
      if (typeof action.correct !== 'boolean') return state;
      const reviewItems = updateReviewItem(state.reviewItems, action.id, item => retestReviewItem(item, action.correct));
      return reviewItems === state.reviewItems ? state : { ...state, reviewItems };
    }

    case 'set_review_confidence': {
      if (!Number.isInteger(action.confidence) || action.confidence < 1 || action.confidence > 5) return state;
      const items = updateReviewItem(state.reviewItems, action.id, item => ({ ...item, confidence: action.confidence }));
      return items === state.reviewItems ? state : { ...state, reviewItems: items };
    }

    case 'resolve_wrong_question':
      if (!WRONG_QUESTION_FIXTURES.some(item => item.id === action.id) || state.wrongResolved.includes(action.id)) return state;
      return { ...state, wrongResolved: [...state.wrongResolved, action.id] };

    case 'select_expression':
      if (!EXPRESSION_FIXTURES.some(item => item.id === action.id)) return state;
      return { ...state, expression: { ...state.expression, selectedId: action.id } };

    case 'edit_expression_draft': {
      if (!EXPRESSION_FIXTURES.some(item => item.id === action.id)
        || state.expression.drafts[action.id] === action.draft) return state;
      return {
        ...state,
        expression: {
          ...state.expression,
          selectedId: action.id,
          drafts: { ...state.expression.drafts, [action.id]: action.draft },
        },
      };
    }

    case 'save_expression_revision': {
      if (!EXPRESSION_FIXTURES.some(item => item.id === action.id) || !action.draft.trim()) return state;
      const previous = state.expression.revisions[action.id] || 0;
      return {
        ...state,
        expression: {
          ...state.expression,
          selectedId: action.id,
          drafts: { ...state.expression.drafts, [action.id]: action.draft },
          revisions: { ...state.expression.revisions, [action.id]: previous + 1 },
          accepted: state.expression.accepted.filter(id => id !== action.id),
        },
      };
    }

    case 'accept_expression':
      if (!EXPRESSION_FIXTURES.some(item => item.id === action.id) || state.expression.accepted.includes(action.id)) return state;
      return { ...state, expression: { ...state.expression, accepted: [...state.expression.accepted, action.id] } };

    case 'start_exam': {
      const fixture = EXAM_FIXTURES.find(exam => exam.id === action.id);
      if (!fixture) return state;
      if (fixture.status === 'finished') {
        return { ...state, exam: { selectedId: fixture.id, phase: 'submitted', currentIndex: Math.max(0, fixture.questions - 1), answered: fixture.questions } };
      }
      const answered = fixture.status === 'draft' ? Math.min(fixture.answered, fixture.questions) : 0;
      return {
        ...state,
        exam: {
          selectedId: fixture.id,
          phase: 'draft',
          currentIndex: Math.min(answered, Math.max(0, fixture.questions - 1)),
          answered,
        },
      };
    }

    case 'answer_exam': {
      const fixture = EXAM_FIXTURES.find(exam => exam.id === state.exam.selectedId);
      if (state.exam.phase !== 'draft' || !fixture || !Number.isInteger(action.index)
        || action.index < 0 || action.index >= fixture.questions) return state;
      return { ...state, exam: { ...state.exam, currentIndex: action.index, answered: Math.max(state.exam.answered, action.index + 1) } };
    }

    case 'advance_exam': {
      const fixture = EXAM_FIXTURES.find(exam => exam.id === state.exam.selectedId);
      if (state.exam.phase !== 'draft' || !fixture) return state;
      return { ...state, exam: { ...state.exam, currentIndex: Math.min(fixture.questions - 1, state.exam.currentIndex + 1) } };
    }

    case 'submit_exam':
      if (state.exam.phase !== 'draft' || state.exam.answered < 1) return state;
      return { ...state, exam: { ...state.exam, phase: 'submitted' } };

    case 'reset_exam':
      return { ...state, exam: { selectedId: 'exam-sprint-01', phase: 'idle', currentIndex: 0, answered: 7 } };

    case 'advance_diagnosis':
      return { ...state, diagnosisStep: Math.min(2, state.diagnosisStep + 1) };

    case 'approve_content':
      if (!CONTENT_REVIEW_ITEMS.some(item => item.id === action.id)) return state;
      return { ...state, contentStatuses: { ...state.contentStatuses, [action.id]: 'approved' } };

    case 'create_backup':
      return state.backupCreated ? state : { ...state, backupCreated: true };

    case 'update_profile':
      if (![action.targetScore, action.dailyMinutes, action.cardCapacity, action.vocabularyCapacity].every(Number.isFinite)) return state;
      return { ...state, profile: { targetScore: Math.max(0, Math.round(action.targetScore)), dailyMinutes: Math.max(60, Math.round(action.dailyMinutes)), cardCapacity: Math.max(0, Math.round(action.cardCapacity)), vocabularyCapacity: Math.max(0, Math.round(action.vocabularyCapacity)) } };

    case 'reset_demo':
      return createInitialState();

    default:
      return state;
  }
}

export function routeFromHash(hash: string): Route {
  const candidate = hash.replace(/^#\/?/, '').split('?')[0];
  if (candidate === 'home' || candidate === '') return 'today';
  return ROUTES.includes(candidate as Route) ? candidate as Route : 'today';
}

export function hashForRoute(route: Route): string {
  return `#/${route}`;
}

export function selectDashboardMetrics(state: DemoState): DashboardMetrics {
  const plannedMinutes = state.tasks.filter(task => task.status !== 'deferred').reduce((total, task) => total + task.durationMinutes, 0);
  const completedMinutes = state.tasks.filter(task => task.status === 'done').reduce((total, task) => total + task.durationMinutes, 0);
  const completedTasks = state.tasks.filter(task => task.status === 'done').length;
  const reviewLoad = state.reviewItems.filter(item => item.status !== 'cleared').length;
  const recentTotal = RECENT_SESSIONS.reduce((total, session) => total + session.total, 0);
  const recentCorrect = RECENT_SESSIONS.reduce((total, session) => total + session.correct, 0);
  const accuracy = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : 0;
  return { plannedMinutes, completedMinutes, completedTasks, totalTasks: state.tasks.length, reviewLoad, accuracy, completionPercent: plannedMinutes ? Math.round((completedMinutes / plannedMinutes) * 100) : 0 };
}

export function selectNextAction(state: DemoState): { label: string; detail: string; route: Route } {
  const activeTask = state.tasks.find(task => task.status === 'in_progress' || task.status === 'todo');
  if (activeTask) return { label: activeTask.title, detail: `${activeTask.durationMinutes} 分钟 · ${activeTask.evidence}`, route: activeTask.linkRoute as Route };
  const dueReview = state.reviewItems.find(item => item.status === 'due');
  if (dueReview) return { label: `复测：${dueReview.title}`, detail: dueReview.dueLabel, route: 'review' };
  return { label: '查看阶段洞察', detail: '本周证据已整理完成', route: 'analytics' };
}

export function selectPlanSummary(state: DemoState): PlanSummary {
  const metrics = selectDashboardMetrics(state);
  const scheduledMinutes = state.tasks.filter(task => task.status !== 'deferred').reduce((total, task) => total + task.durationMinutes, 0);
  return {
    capacityMinutes: state.profile.dailyMinutes || DAILY_CAPACITY_MINUTES,
    scheduledMinutes, completedMinutes: metrics.completedMinutes,
    remainingMinutes: Math.max(0, scheduledMinutes - metrics.completedMinutes),
    utilizationPercent: Math.min(100, Math.round((scheduledMinutes / (state.profile.dailyMinutes || DAILY_CAPACITY_MINUTES)) * 100)),
    deferredCount: state.tasks.filter(task => task.status === 'deferred').length,
    evidenceCount: state.tasks.filter(task => task.completionMode === 'evidence').length,
    startedCount: state.tasks.filter(task => task.status === 'in_progress' || task.status === 'done').length,
  };
}

export interface PlanGroups { 上午: DemoTask[]; 下午: DemoTask[]; 晚上: DemoTask[]; }
export function selectPlanGroups(state: DemoState): PlanGroups {
  const groups: PlanGroups = { 上午: [], 下午: [], 晚上: [] };
  for (const task of state.tasks) groups[task.slot].push(task);
  return groups;
}

export function selectRecommendation() { return RECOMMENDATION; }

export function selectQuizResult(state: DemoState): QuizResult {
  const answered = state.quiz.answers.filter(answer => answer !== null).length;
  const missed = state.quiz.answers.reduce<number>((count, answer, index) => answer !== null && answer !== QUIZ_FIXTURES[index]?.correctIndex ? count + 1 : count, 0);
  return { score: state.quiz.score, maxScore: QUIZ_FIXTURES.length, answered, total: QUIZ_FIXTURES.length, missed, complete: state.quiz.complete };
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

export function selectCurrentQuestion(state: DemoState): QuizQuestion { return QUIZ_FIXTURES[state.quiz.index] ?? QUIZ_FIXTURES[0]; }
export function selectCurrentAnswerCorrect(state: DemoState): boolean | null {
  if (!state.quiz.submitted) return null;
  return state.quiz.selectedIndex === selectCurrentQuestion(state).correctIndex;
}
export function selectTodayTasks(state: DemoState): DemoTask[] { return state.tasks.filter(task => task.status !== 'deferred').slice(0, 4); }
export function selectActivity() { return ACTIVITY_FIXTURES; }
export function selectTrack() {
  return {
    name: MIRROR_PROFILE.targetLabel,
    subtitle: '基础巩固阶段 · 示例工作台',
    examDate: MIRROR_PROFILE.examDate,
    targetScore: MIRROR_PROFILE.targetScore,
  };
}
export function selectDaysRemaining(): number { return daysUntil(MIRROR_PROFILE.examDate); }
export function selectReviewItem(state: DemoState, id: string): ReviewItem | undefined { return state.reviewItems.find(item => item.id === id); }
export function selectActiveReviewItems(state: DemoState): ReviewItem[] { return state.reviewItems.filter(item => item.status !== 'cleared'); }
export function selectClearedReviewItems(state: DemoState): ReviewItem[] { return state.reviewItems.filter(item => item.status === 'cleared'); }
export function selectStatusLabel(status: ReviewStatus): string { return status === 'due' ? '待复测' : status === 'watch' ? '观察中' : '已关闭'; }

export function selectStudyStatus(state: DemoState, id: string): KnowledgeStatus {
  return state.studyStatuses[id] || KNOWLEDGE_POINTS.find(point => point.id === id)?.status || 'unseen';
}

export function selectStudyProgress(state: DemoState, chapterId?: string): { total: number; mastered: number; learning: number; review: number } {
  const points = KNOWLEDGE_POINTS.filter(point => !chapterId || point.chapterId === chapterId);
  return points.reduce((result, point) => {
    result.total += 1;
    const status = selectStudyStatus(state, point.id);
    if (status === 'mastered') result.mastered += 1;
    if (status === 'learning') result.learning += 1;
    if (status === 'review') result.review += 1;
    return result;
  }, { total: 0, mastered: 0, learning: 0, review: 0 });
}

export function selectRouteLabel(route: Route): string {
  const labels: Partial<Record<Route, string>> = {
    today: '首页', plan: '计划', study: '学习', 'study-professional': '专业主线',
    'study-language': '语言训练', 'study-foundation': '公共基础', practice: '按题型练习',
    'past-exams': '历年试题', exam: '模拟考试', review: '间隔复习', 'wrong-questions': '错题本',
    expression: '主观表达', analytics: '数据分析', diagnosis: '能力诊断', system: '系统与目标',
    'content-review': '内容治理', 'case-study': '产品案例',
  };
  return labels[route] || '首页';
}

export function selectChapter(trackId: string, chapterId: string): typeof STUDY_CHAPTERS[number] | undefined {
  return STUDY_CHAPTERS.find(chapter => chapter.trackId === trackId && chapter.id === chapterId);
}
