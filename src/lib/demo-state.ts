import {
  ACTIVITY_FIXTURES,
  CONTENT_REVIEW_ITEMS,
  DAILY_CAPACITY_MINUTES,
  DIAGNOSIS_SAMPLES,
  EXAM_FIXTURES,
  EXPRESSION_FIXTURES,
  KNOWLEDGE_POINTS,
  MICRO_LESSONS,
  MIRROR_PROFILE,
  PLAN_DAY_TEMPLATES,
  PRACTICE_BANK,
  QUIZ_FIXTURES,
  RECENT_SESSIONS,
  RECOMMENDATION,
  REVIEW_DECK,
  REVIEW_FIXTURES,
  STUDY_CHAPTERS,
  TASK_FIXTURES,
  WRONG_BOOK,
  WRONG_QUESTION_FIXTURES,
  type DemoTask,
  type PracticeQuestion,
  type PracticeQuestionType,
  type PracticeTrackId,
  type QuizQuestion,
  type ReviewCard,
  type ReviewItem,
  type ReviewStatus,
  type TaskStatus,
  type WrongBookItem,
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

export interface PracticeConfigState {
  trackId: PracticeTrackId | 'all';
  chapterId: string;
  questionType: PracticeQuestionType;
  count: number;
  focusKnowledgePointId?: string;
}

export interface PracticeAnswerRecord {
  questionId: string;
  selectedIndexes: number[];
  text: string;
  submitted: boolean;
  score: number;
  maxScore: number;
  missedPoints: string[];
  durationSeconds: number;
}

export interface PracticeHistoryItem {
  questionId: string;
  prompt: string;
  correct: boolean;
  score: number;
  maxScore: number;
}

export interface PracticeHistoryRecord {
  id: string;
  label: string;
  questionType: PracticeQuestionType;
  trackLabel: string;
  count: number;
  correct: number;
  total: number;
  score: number;
  maxScore: number;
  items: PracticeHistoryItem[];
}

export interface PracticeEngineState {
  config: PracticeConfigState;
  questions: PracticeQuestion[];
  answers: Record<string, PracticeAnswerRecord>;
  currentIndex: number;
  phase: 'idle' | 'active' | 'complete';
  history: PracticeHistoryRecord[];
}

export interface ReviewDeckItemState extends ReviewCard {
  stage: 0 | 1 | 2;
  status: ReviewStatus;
  attempts: number;
  confidence: number;
  nextIntervalDays: number;
  lastResultLabel: string;
}

export interface WrongBookItemState extends WrongBookItem {
  resolved: boolean;
  retestInDays: number;
}

export type MicroLessonStatus = 'unseen' | 'in_progress' | 'done';

export interface PlanHistoryEvent {
  id: string;
  dateOffset: number;
  label: string;
  taskId: string;
  action: 'completed' | 'deferred' | 'skipped' | 'started' | 'diagnosis_added';
  minutes: number;
}

export interface DiagnosisReport {
  generated: boolean;
  title: string;
  conclusion: string;
  evidence: string[];
  actions: string[];
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
  diagnosis: { report: DiagnosisReport | null };
  contentStatuses: Record<string, string>;
  backupCreated: boolean;
  planDateOffset: number;
  planHistory: PlanHistoryEvent[];
  practice: PracticeEngineState;
  reviewDeck: ReviewDeckItemState[];
  wrongBook: WrongBookItemState[];
  microLessons: Record<string, MicroLessonStatus>;
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
  | { type: 'change_plan_date'; offset: number }
  | { type: 'skip_task'; id: string; reason: string }
  | { type: 'split_task'; id: string }
  | { type: 'configure_practice'; trackId: PracticeTrackId | 'all'; chapterId: string; questionType: PracticeQuestionType; count: number; focusKnowledgePointId?: string }
  | { type: 'toggle_option'; index: number }
  | { type: 'write_answer'; text: string }
  | { type: 'finish_practice' }
  | { type: 'complete_micro_lesson'; pointId: string }
  | { type: 'rate_review_card'; id: string; quality: number }
  | { type: 'suspend_leech'; id: string }
  | { type: 'resume_leech'; id: string }
  | { type: 'resolve_wrong'; id: string }
  | { type: 'schedule_wrong_retest'; id: string }
  | { type: 'generate_diagnosis' }
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
    diagnosis: { report: null },
    contentStatuses: Object.fromEntries(CONTENT_REVIEW_ITEMS.map(item => [item.id, item.status])),
    backupCreated: false,
    planDateOffset: 0,
    planHistory: [
      { id: 'seed-plan-01', dateOffset: 0, label: '今天', taskId: 'task-review-05', action: 'completed', minutes: 25 },
      { id: 'seed-plan-02', dateOffset: -1, label: '昨天', taskId: 'plan-d-1-01', action: 'completed', minutes: 45 },
      { id: 'seed-plan-03', dateOffset: -1, label: '昨天', taskId: 'plan-d-1-02', action: 'completed', minutes: 35 },
      { id: 'seed-plan-04', dateOffset: -1, label: '昨天', taskId: 'plan-d-1-03', action: 'completed', minutes: 30 },
      { id: 'seed-plan-05', dateOffset: 0, label: '今天', taskId: 'task-mock-06', action: 'deferred', minutes: 20 },
    ],
    practice: {
      config: { trackId: 'all', chapterId: 'all', questionType: 'single', count: 3 },
      questions: [],
      answers: {},
      currentIndex: 0,
      phase: 'idle',
      history: [],
    },
    reviewDeck: REVIEW_DECK.map(card => ({
      ...card,
      stage: card.failureCount >= 2 ? 0 : 0,
      status: 'due',
      attempts: card.failureCount,
      confidence: Math.max(1, 4 - card.failureCount),
      nextIntervalDays: 1,
      lastResultLabel: card.queueKind === 'new' ? '新卡待学' : '待复测',
    })),
    wrongBook: WRONG_BOOK.map(item => ({ ...item })),
    microLessons: Object.fromEntries(MICRO_LESSONS.map(lesson => [
      lesson.pointId,
      KNOWLEDGE_POINTS.find(point => point.id === lesson.pointId)?.status === 'mastered' ? 'done' as const : 'unseen' as const,
    ])),
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

function selectPracticeQuestions(config: PracticeConfigState): PracticeQuestion[] {
  const byType = PRACTICE_BANK.filter(question => question.type === config.questionType);
  const byTrack = byType.filter(question => config.trackId === 'all' || question.trackId === config.trackId);
  const byChapter = byTrack.filter(question => config.chapterId === 'all' || question.chapterId === config.chapterId);
  const pool = byChapter.length > 0 ? byChapter : byTrack.length > 0 ? byTrack : byType;
  const focus = config.focusKnowledgePointId
    ? pool.filter(question => question.knowledgePointId === config.focusKnowledgePointId)
    : [];
  const orderedWithDuplicates = [...focus, ...pool, ...byTrack, ...byType];
  const ordered = orderedWithDuplicates.filter((question, index) => orderedWithDuplicates.findIndex(item => item.id === question.id) === index);
  const count = Math.max(1, Math.min(10, Math.round(config.count) || 1));
  return ordered.slice(0, count);
}

function gradeChoiceAnswer(question: PracticeQuestion, selectedIndexes: number[]): { correct: boolean; score: number; maxScore: number; missedPoints: string[] } {
  if (question.type === 'multi' && question.correctIndexes) {
    const selected = new Set(selectedIndexes);
    const expected = new Set(question.correctIndexes);
    const correct = selected.size === expected.size && [...selected].every(index => expected.has(index));
    return { correct, score: correct ? 1 : 0, maxScore: 1, missedPoints: correct ? [] : ['正确选项：' + question.answer] };
  }
  const correct = selectedIndexes.length === 1 && selectedIndexes[0] === question.correctIndex;
  return { correct, score: correct ? 1 : 0, maxScore: 1, missedPoints: correct ? [] : ['正确答案：' + question.answer] };
}

function textIncludesBigrams(text: string, phrase: string): boolean {
  const normalizedText = text.replace(/\s+/g, '');
  const normalizedPhrase = phrase.replace(/\s+/g, '');
  if (!normalizedPhrase) return false;
  const grams = normalizedPhrase.length <= 2
    ? [normalizedPhrase]
    : Array.from({ length: normalizedPhrase.length - 1 }, (_, index) => normalizedPhrase.slice(index, index + 2));
  const hits = grams.filter(gram => normalizedText.includes(gram)).length;
  return hits / grams.length >= 0.7;
}

function gradeTextAnswer(question: PracticeQuestion, text: string): { correct: boolean; score: number; maxScore: number; missedPoints: string[] } {
  const normalized = text.replace(/\s+/g, '');
  if (question.type === 'verbatim' && question.expectedLines) {
    const hits = question.expectedLines.filter(line => textIncludesBigrams(normalized, line)).length;
    const maxScore = question.expectedLines.length;
    return {
      correct: hits === maxScore,
      score: hits,
      maxScore,
      missedPoints: question.expectedLines.filter(line => !textIncludesBigrams(normalized, line)),
    };
  }
  const keywords = question.keywords ?? [];
  const scoringPoints = question.scoringPoints ?? [];
  const pointHits = scoringPoints.filter(point => keywords.some(keyword => point.includes(keyword) && normalized.includes(keyword))).length;
  const lengthBonus = question.expectedLength && normalized.length >= Math.round(question.expectedLength * 0.6) ? 1 : 0;
  const maxScore = Math.max(1, scoringPoints.length + 1);
  const score = Math.min(maxScore, pointHits + lengthBonus);
  return {
    correct: score >= Math.ceil(maxScore * 0.6),
    score,
    maxScore,
    missedPoints: scoringPoints.filter(point => !keywords.some(keyword => point.includes(keyword) && normalized.includes(keyword))),
  };
}

function splitDemoTask(task: DemoTask, tasks: DemoTask[]): DemoTask[] {
  if (task.durationMinutes < 20 || task.status === 'done' || task.status === 'deferred' || task.status === 'skipped') return tasks;
  const firstMinutes = Math.ceil(task.durationMinutes / 2);
  const secondMinutes = task.durationMinutes - firstMinutes;
  const first: DemoTask = {
    ...task,
    id: `${task.id}-part-a`,
    title: `${task.title}（第一部分）`,
    durationMinutes: firstMinutes,
    evidence: `${task.evidence}（前半）`,
    detail: `${task.detail} 先完成前半部分。`,
  };
  const second: DemoTask = {
    ...task,
    id: `${task.id}-part-b`,
    title: `${task.title}（第二部分）`,
    durationMinutes: secondMinutes,
    priority: task.priority === 'high' ? 'medium' : task.priority,
    evidence: `${task.evidence}（后半）`,
    detail: `${task.detail} 再完成剩余部分。`,
  };
  return tasks.flatMap(item => item.id === task.id ? [first, second] : [item]);
}

function reviewIntervalForQuality(quality: number): number {
  if (quality <= 1) return 1;
  if (quality === 2) return 2;
  if (quality === 3) return 3;
  if (quality === 4) return 5;
  return 7;
}

function buildDiagnosisReport(state: DemoState): DiagnosisReport {
  const sessions = state.practice.history.length;
  const totalScore = state.practice.history.reduce((sum, session) => sum + session.score, 0);
  const totalMax = state.practice.history.reduce((sum, session) => sum + session.maxScore, 0);
  const wrongCount = state.wrongBook.filter(item => !item.resolved).length;
  const reviewDue = state.reviewDeck.filter(item => item.status === 'due').length;
  const weakTrack = DIAGNOSIS_SAMPLES.find(sample => sample.trackId === 'language');
  const evidence = [
    sessions > 0 ? `本次会话已完成 ${sessions} 组练习` : '当前还没有新的练习会话，报告基于固定示例基线',
    `未解决错题 ${wrongCount} 条，到期复习卡 ${reviewDue} 张`,
    '三轨样本中，表达与迁移类证据相对较少',
  ];
  return {
    generated: true,
    title: '能力诊断报告（示例）',
    conclusion: `迁移与表达的证据链仍不完整：练习累计得分 ${totalScore}/${totalMax || 1}，而${weakTrack?.label ?? '语言训练'}需要更多独立的结构化作答。`,
    evidence,
    actions: ['安排一次跨情境迁移练习', '完成一版主张—依据—限制的结构化重写', '把诊断建议作为任务写回计划'],
  };
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

    case 'start_practice': {
      const questions = selectPracticeQuestions(state.practice.config);
      return {
        ...state,
        quiz: {
          ...state.quiz, index: 0, selectedIndex: null,
          answers: QUIZ_FIXTURES.map(() => null), submitted: false, complete: false,
          score: 0, reviewAdded: false, mode: action.mode || 'single', started: true,
        },
        practice: {
          ...state.practice,
          questions,
          answers: {},
          currentIndex: 0,
          phase: questions.length > 0 ? 'active' : state.practice.phase,
        },
      };
    }

    case 'select_answer':
      if (state.quiz.complete || state.quiz.submitted || !Number.isInteger(action.index)
        || action.index < 0 || action.index >= (QUIZ_FIXTURES[state.quiz.index]?.options.length ?? 0)) return state;
      return { ...state, quiz: { ...state.quiz, selectedIndex: action.index, started: true } };

    case 'submit_answer': {
      if (state.practice.phase === 'active') {
        const question = state.practice.questions[state.practice.currentIndex];
        if (question && state.practice.answers[question.id]) {
          const answer = state.practice.answers[question.id];
          if (!answer.submitted) {
            const isTextQuestion = question.type === 'short' || question.type === 'verbatim';
            if (isTextQuestion && !answer.text.trim()) return state;
            const graded = isTextQuestion
              ? gradeTextAnswer(question, answer.text)
              : gradeChoiceAnswer(question, answer.selectedIndexes);
            return {
              ...state,
              practice: {
                ...state.practice,
                answers: {
                  ...state.practice.answers,
                  [question.id]: { ...answer, submitted: true, score: graded.score, maxScore: graded.maxScore, missedPoints: graded.missedPoints },
                },
              },
            };
          }
        }
      }
      if (state.quiz.complete || state.quiz.submitted || state.quiz.selectedIndex === null) return state;
      const answers = state.quiz.answers.map((answer, index) => index === state.quiz.index ? state.quiz.selectedIndex : answer);
      return { ...state, quiz: { ...state.quiz, answers, submitted: true, started: true, score: calculateScore(answers) } };
    }

    case 'advance_question': {
      if (state.practice.phase === 'active') {
        const question = state.practice.questions[state.practice.currentIndex];
        if (question && state.practice.answers[question.id]?.submitted) {
          if (state.practice.currentIndex >= state.practice.questions.length - 1) {
            return { ...state, practice: { ...state.practice, phase: 'complete' } };
          }
          return { ...state, practice: { ...state.practice, currentIndex: state.practice.currentIndex + 1 } };
        }
      }
      if (!state.quiz.submitted) return state;
      if (state.quiz.index >= QUIZ_FIXTURES.length - 1) return { ...state, quiz: { ...state.quiz, complete: true } };
      return { ...state, quiz: { ...state.quiz, index: state.quiz.index + 1, selectedIndex: null, submitted: false } };
    }

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

    case 'change_plan_date': {
      const offset = Number.isInteger(action.offset) ? Math.max(-2, Math.min(2, action.offset)) : state.planDateOffset;
      if (offset === state.planDateOffset) return state;
      const template = PLAN_DAY_TEMPLATES.find(day => day.dateOffset === offset);
      return {
        ...state,
        planDateOffset: offset,
        tasks: template ? template.tasks.map(task => ({ ...task })) : state.tasks,
      };
    }

    case 'skip_task': {
      const current = state.tasks.find(task => task.id === action.id);
      if (!current || current.status === 'done' || current.status === 'deferred' || current.status === 'skipped') return state;
      if (typeof action.reason !== 'string' || !action.reason.trim()) return state;
      const reason = action.reason.trim();
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === action.id ? { ...task, status: 'skipped', deferReason: reason } : task),
        planHistory: [...state.planHistory, { id: `plan-skip-${action.id}-${state.planHistory.length}`, dateOffset: state.planDateOffset, label: PLAN_DAY_TEMPLATES.find(day => day.dateOffset === state.planDateOffset)?.label || '今天', taskId: action.id, action: 'skipped', minutes: current.durationMinutes }],
      };
    }

    case 'split_task': {
      const current = state.tasks.find(task => task.id === action.id);
      if (!current || current.status === 'done' || current.status === 'deferred' || current.status === 'skipped') return state;
      const tasks = splitDemoTask(current, state.tasks);
      return tasks === state.tasks ? state : { ...state, tasks };
    }

    case 'configure_practice': {
      const trackId = action.trackId === 'all' || action.trackId === 'professional' || action.trackId === 'language' || action.trackId === 'foundation' ? action.trackId : 'all';
      const questionType = action.questionType === 'single' || action.questionType === 'multi' || action.questionType === 'short' || action.questionType === 'verbatim' ? action.questionType : 'single';
      const count = Math.max(1, Math.min(10, Math.round(action.count) || 1));
      const config: PracticeConfigState = {
        trackId, chapterId: action.chapterId || 'all', questionType, count,
        focusKnowledgePointId: action.focusKnowledgePointId,
      };
      return { ...state, practice: { ...state.practice, config, questions: [], answers: {}, currentIndex: 0, phase: 'idle' } };
    }

    case 'toggle_option': {
      if (state.practice.phase !== 'active') return state;
      const question = state.practice.questions[state.practice.currentIndex];
      if (!question || question.type === 'short' || question.type === 'verbatim') return state;
      const existing = state.practice.answers[question.id];
      const selected = existing?.selectedIndexes ?? [];
      const next = selected.includes(action.index) ? selected.filter(index => index !== action.index) : [...selected, action.index];
      return {
        ...state,
        practice: {
          ...state.practice,
          answers: { ...state.practice.answers, [question.id]: { questionId: question.id, selectedIndexes: next, text: '', submitted: false, score: 0, maxScore: 0, missedPoints: [], durationSeconds: 0 } },
        },
      };
    }

    case 'write_answer': {
      if (state.practice.phase !== 'active') return state;
      const question = state.practice.questions[state.practice.currentIndex];
      if (!question) return state;
      return {
        ...state,
        practice: {
          ...state.practice,
          answers: { ...state.practice.answers, [question.id]: { questionId: question.id, selectedIndexes: [], text: action.text, submitted: false, score: 0, maxScore: 0, missedPoints: [], durationSeconds: 0 } },
        },
      };
    }

    case 'finish_practice': {
      if (state.practice.phase !== 'complete') return state;
      const questions = state.practice.questions;
      const answers = questions.map(question => state.practice.answers[question.id]).filter(Boolean);
      if (answers.length < questions.length) return state;
      const correctCount = answers.filter(answer => answer.score >= answer.maxScore).length;
      const score = answers.reduce((sum, answer) => sum + answer.score, 0);
      const maxScore = answers.reduce((sum, answer) => sum + answer.maxScore, 0);
      const history: PracticeHistoryRecord = {
        id: `practice-session-${state.practice.history.length + 1}`,
        label: `示例会话 ${state.practice.history.length + 1}`,
        questionType: state.practice.config.questionType,
        trackLabel: state.practice.config.trackId === 'all' ? '综合训练' : state.practice.config.trackId === 'professional' ? '专业主线' : state.practice.config.trackId === 'language' ? '语言训练' : '公共基础',
        count: questions.length,
        correct: correctCount,
        total: questions.length,
        score,
        maxScore,
        items: questions.map(question => {
          const answer = state.practice.answers[question.id];
          return {
            questionId: question.id,
            prompt: question.prompt,
            correct: answer.score >= answer.maxScore,
            score: answer.score,
            maxScore: answer.maxScore,
          };
        }),
      };
      const newWrongIds = questions.filter(question => {
        const answer = state.practice.answers[question.id];
        return answer && answer.score < answer.maxScore;
      }).map(question => `wrong-${question.id}`);
      const additions = newWrongIds.filter(id => !state.wrongBook.some(item => item.id === id)).map(id => {
        const question = questions.find(item => `wrong-${item.id}` === id)!;
        const point = KNOWLEDGE_POINTS.find(item => item.id === question.knowledgePointId);
        return {
          id,
          title: point?.title ?? question.knowledgePointId,
          trackId: question.trackId,
          chapterId: question.chapterId,
          knowledgePointId: question.knowledgePointId,
          reason: '本轮练习未完全答对',
          action: '进入知识点微课并完成一次补救练习',
          attempts: 1,
          resolved: false,
          retestInDays: 3,
          sourceLabel: '练习结果 · 示例记录',
        };
      });
      return {
        ...state,
        practice: { ...state.practice, phase: 'complete', history: [...state.practice.history, history] },
        wrongBook: additions.length ? [...state.wrongBook, ...additions] : state.wrongBook,
        studyStatuses: Object.fromEntries(questions.filter(question => {
          const answer = state.practice.answers[question.id];
          return answer && answer.score >= answer.maxScore;
        }).map(question => [question.knowledgePointId, 'mastered' as KnowledgeStatus])),
      };
    }

    case 'complete_micro_lesson': {
      if (!MICRO_LESSONS.some(lesson => lesson.pointId === action.pointId)) return state;
      const current = state.microLessons[action.pointId];
      if (current === 'done') return state;
      return { ...state, microLessons: { ...state.microLessons, [action.pointId]: 'done' } };
    }

    case 'rate_review_card': {
      const card = state.reviewDeck.find(item => item.id === action.id);
      if (!card || card.status === 'cleared' || card.suspended) return state;
      if (!Number.isInteger(action.quality) || action.quality < 0 || action.quality > 5) return state;
      const correct = action.quality >= 3;
      const nextIntervalDays = reviewIntervalForQuality(action.quality);
      const nextCard = (): ReviewDeckItemState => {
        if (correct && card.stage === 0) {
          return { ...card, stage: 1, status: 'watch', attempts: card.attempts + 1, confidence: Math.min(5, Math.max(1, action.quality)), nextIntervalDays, lastResultLabel: `已保存 · ${nextIntervalDays} 天后复习` };
        }
        if (correct && card.stage === 1) {
          return { ...card, stage: 2, status: 'cleared', attempts: card.attempts + 1, confidence: Math.max(card.confidence, action.quality), nextIntervalDays, lastResultLabel: '已完成' };
        }
        return { ...card, stage: 0, status: 'due', attempts: card.attempts + 1, confidence: Math.min(2, Math.max(1, action.quality)), nextIntervalDays, lastResultLabel: `需要重练 · ${nextIntervalDays} 天后再次复习` };
      };
      return { ...state, reviewDeck: state.reviewDeck.map(item => item.id === action.id ? nextCard() : item) };
    }

    case 'suspend_leech': {
      const card = state.reviewDeck.find(item => item.id === action.id);
      if (!card || card.suspended) return state;
      return { ...state, reviewDeck: state.reviewDeck.map(item => item.id === action.id ? { ...item, suspended: true } : item) };
    }

    case 'resume_leech': {
      const card = state.reviewDeck.find(item => item.id === action.id);
      if (!card || !card.suspended) return state;
      return { ...state, reviewDeck: state.reviewDeck.map(item => item.id === action.id ? { ...item, suspended: false, status: 'due', stage: 0 } : item) };
    }

    case 'resolve_wrong': {
      const item = state.wrongBook.find(record => record.id === action.id);
      if (!item || item.resolved) return state;
      return { ...state, wrongBook: state.wrongBook.map(record => record.id === action.id ? { ...record, resolved: true } : record) };
    }

    case 'schedule_wrong_retest': {
      const item = state.wrongBook.find(record => record.id === action.id);
      if (!item || item.resolved) return state;
      return { ...state, wrongBook: state.wrongBook.map(record => record.id === action.id ? { ...record, retestInDays: 3 } : record) };
    }

    case 'generate_diagnosis': {
      if (state.diagnosis.report?.generated) return state;
      const diagnosisTask: DemoTask = {
        id: 'task-diagnosis-01',
        title: '诊断建议：迁移练习与结构化重写',
        subject: '能力诊断',
        slot: '晚上',
        durationMinutes: 30,
        priority: 'medium',
        status: 'todo',
        evidence: '完成一次跨情境迁移练习和一版结构化重写',
        detail: '由能力诊断生成：先补表达与迁移证据，再把结论带回计划。',
        taskType: 'diagnosis',
        completionMode: 'evidence',
        linkRoute: 'practice',
      };
      const tasks = state.tasks.some(task => task.id === diagnosisTask.id) ? state.tasks : [...state.tasks, diagnosisTask];
      return {
        ...state,
        tasks,
        diagnosis: { report: buildDiagnosisReport(state) },
        diagnosisStep: 2,
        planHistory: [...state.planHistory, { id: 'plan-diagnosis-01', dateOffset: state.planDateOffset, label: selectPlanDateLabel(state), taskId: diagnosisTask.id, action: 'diagnosis_added', minutes: diagnosisTask.durationMinutes }],
      };
    }

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

export function selectPlanDateLabel(state: DemoState): string {
  return PLAN_DAY_TEMPLATES.find(day => day.dateOffset === state.planDateOffset)?.label || '今天';
}

export function selectPlanTasks(state: DemoState): DemoTask[] {
  return state.tasks;
}

export interface PlanWeeklyReview {
  plannedMinutes: number;
  completedMinutes: number;
  skippedMinutes: number;
  deferredMinutes: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  nextSteps: string[];
}

export function selectPlanWeeklyReview(state: DemoState): PlanWeeklyReview {
  const completed = state.planHistory.filter(event => event.action === 'completed');
  const skipped = state.planHistory.filter(event => event.action === 'skipped');
  const deferred = state.planHistory.filter(event => event.action === 'deferred');
  const templateTasks = PLAN_DAY_TEMPLATES.flatMap(day => day.tasks);
  const plannedMinutes = templateTasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const completedMinutes = completed.reduce((sum, event) => sum + event.minutes, 0);
  const skippedMinutes = skipped.reduce((sum, event) => sum + event.minutes, 0);
  const deferredMinutes = deferred.reduce((sum, event) => sum + event.minutes, 0);
  const totalTasks = state.planHistory.length;
  const completionRate = plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;
  const nextSteps = [
    state.tasks.some(task => task.status === 'deferred' || task.status === 'skipped') ? '处理被延后或跳过的任务，保留原因并重新安排' : '按计划完成今天的证据任务',
    '完成“控制条件与结果解释”的第二次独立复测',
    '把表达训练拆成一版短回答和一次结构化重写',
  ];
  return { plannedMinutes, completedMinutes, skippedMinutes, deferredMinutes, completedTasks: completed.length, totalTasks, completionRate, nextSteps };
}

export function selectPracticeQuestion(state: DemoState): PracticeQuestion | undefined {
  return state.practice.questions[state.practice.currentIndex];
}

export function selectPracticeAnswer(state: DemoState, questionId: string) {
  return state.practice.answers[questionId];
}

export function selectPracticeProgress(state: DemoState): { answered: number; total: number; percent: number } {
  const total = state.practice.questions.length;
  const answered = Object.values(state.practice.answers).filter(answer => answer.submitted).length;
  return { answered, total, percent: total > 0 ? Math.round((answered / total) * 100) : 0 };
}

export interface ReviewDeckSummary {
  due: number;
  watch: number;
  cleared: number;
  active: number;
  vocabularyDue: number;
  suspended: number;
  leechCount: number;
}

export function selectReviewDeckSummary(state: DemoState): ReviewDeckSummary {
  return state.reviewDeck.reduce<ReviewDeckSummary>((summary, card) => {
    if (card.suspended) summary.suspended += 1;
    if (card.status === 'due') summary.due += 1;
    if (card.status === 'watch') summary.watch += 1;
    if (card.status === 'cleared') summary.cleared += 1;
    if (card.status !== 'cleared' && !card.suspended) summary.active += 1;
    if (card.cardType === 'vocabulary' && card.status === 'due') summary.vocabularyDue += 1;
    if (card.failureCount >= 3) summary.leechCount += 1;
    return summary;
  }, { due: 0, watch: 0, cleared: 0, active: 0, vocabularyDue: 0, suspended: 0, leechCount: 0 });
}

export function selectActiveReviewDeck(state: DemoState): ReviewDeckItemState[] {
  return state.reviewDeck.filter(card => card.status !== 'cleared' && !card.suspended);
}

export function selectWrongBookItems(state: DemoState): WrongBookItemState[] {
  return state.wrongBook;
}

export function selectMicroLessonStatus(state: DemoState, pointId: string): MicroLessonStatus {
  return state.microLessons[pointId] || 'unseen';
}

export function selectDiagnosisReport(state: DemoState): DiagnosisReport | null {
  return state.diagnosis.report;
}

export interface AnalyticsPayload {
  totalAnswers: number;
  totalReviews: number;
  overallAccuracy: number;
  subjectAccuracy: Array<{ subject: string; total: number; correct: number; accuracy: number }>;
  weakPoints: Array<{ subject: string; title: string; attempts: number; accuracy: number }>;
  radarData: Array<{ subject: string; progress: number; mastery: number; accuracy: number }>;
}

export function selectAnalyticsPayload(state: DemoState): AnalyticsPayload {
  const history = state.practice.history;
  const answered = history.reduce((sum, session) => sum + session.total, 0);
  const correct = history.reduce((sum, session) => sum + session.correct, 0);
  const base = DIAGNOSIS_SAMPLES;
  const subjectAccuracy = base.map(sample => {
    const trackHistory = history.filter(session => session.trackLabel === sample.label);
    const trackCorrect = trackHistory.reduce((sum, session) => sum + session.correct, 0);
    const trackTotal = trackHistory.reduce((sum, session) => sum + session.total, 0) || sample.sessions;
    const trackBaseCorrect = sample.accuracy === 82 ? Math.round(sample.sessions * 0.82) : sample.accuracy === 76 ? Math.round(sample.sessions * 0.76) : Math.round(sample.sessions * 0.79);
    const total = trackTotal;
    const totalCorrect = trackCorrect + (trackHistory.length === 0 ? trackBaseCorrect : 0);
    return { subject: sample.label, total, correct: totalCorrect, accuracy: total > 0 ? Math.round((totalCorrect / total) * 100) : 0 };
  });
  const weakPoints = state.wrongBook.filter(item => !item.resolved).slice(0, 3).map((item, index) => ({
    subject: item.trackId === 'professional' ? '专业主线' : item.trackId === 'language' ? '语言训练' : '公共基础',
    title: item.title,
    attempts: item.attempts,
    accuracy: Math.max(20, 64 - index * 7),
  }));
  const overallAccuracy = answered > 0 ? Math.round((correct / answered) * 100) : 78;
  return {
    totalAnswers: answered || 128,
    totalReviews: state.reviewDeck.reduce((sum, card) => sum + card.attempts, 0) || 214,
    overallAccuracy,
    subjectAccuracy,
    weakPoints: weakPoints.length ? weakPoints : [{ subject: '表达训练', title: '观点与依据的连接', attempts: 6, accuracy: 50 }],
    radarData: [
      { subject: '理解', progress: 78, mastery: 70, accuracy: subjectAccuracy[0]?.accuracy ?? 82 },
      { subject: '记忆', progress: 65, mastery: 58, accuracy: subjectAccuracy[1]?.accuracy ?? 76 },
      { subject: '迁移', progress: 54, mastery: 48, accuracy: 64 },
      { subject: '表达', progress: 46, mastery: 42, accuracy: subjectAccuracy[2]?.accuracy ?? 79 },
      { subject: '复盘', progress: 72, mastery: 68, accuracy: 79 },
    ],
  };
}
