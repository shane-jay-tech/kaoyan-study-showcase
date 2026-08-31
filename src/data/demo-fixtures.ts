/**
 * Compatibility exports for the original compact showcase components.
 * The canonical public data owner is public-source-mirror.ts.
 */
export {
  PUBLIC_DEMO_LABEL,
  DAILY_CAPACITY_MINUTES,
  TASK_FIXTURES,
  ACTIVITY_FIXTURES,
  RECENT_SESSIONS,
  WEEKLY_DISTRIBUTION,
  SUBJECT_INSIGHTS,
  REVIEW_PRESSURE,
  DEFER_REASON_OPTIONS,
  RECOMMENDATION,
  QUIZ_FIXTURES,
  REVIEW_FIXTURES,
  CASE_STUDY_POINTS,
  type DemoTask,
  type TaskStatus,
  type TaskSlot,
  type TaskPriority,
  type ActivityPoint,
  type Recommendation,
  type QuizQuestion,
  type ReviewStatus,
  type ReviewItem,
} from './public-source-mirror';

import { MIRROR_PROFILE } from './public-source-mirror';

/** Legacy shape retained so older imported consumers remain source-compatible. */
export const DEMO_TRACK = {
  name: MIRROR_PROFILE.targetLabel,
  subtitle: '基础巩固阶段 · 示例工作台',
  examDate: MIRROR_PROFILE.examDate,
  targetScore: MIRROR_PROFILE.targetScore,
};
