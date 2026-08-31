export const PUBLIC_DEMO_LABEL = '公开演示 · 虚构数据';

/**
 * Fictional exam track. `examDate` is an invented date used only to render
 * a countdown; the remaining days are derived by a selector (`selectDaysRemaining`)
 * instead of being duplicated here, so the two can never drift apart.
 */
export const DEMO_TRACK = {
  name: '心理学综合备考',
  subtitle: '秋季冲刺轨道 · 示例工作台',
  examDate: '2026-12-25',
  targetScore: 240,
};

/** Daily planning capacity in minutes, used by the plan summary selector. */
export const DAILY_CAPACITY_MINUTES = 180;

/**
 * Recent practice sessions used to derive the dashboard "近期正确率" metric.
 * All values are invented; the ratio is computed by a selector.
 */
export const RECENT_SESSIONS: { correct: number; total: number }[] = [
  { correct: 4, total: 5 },
  { correct: 4, total: 5 },
  { correct: 4, total: 5 },
  { correct: 5, total: 5 },
  { correct: 5, total: 5 },
];

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'deferred';
export type TaskSlot = '上午' | '下午' | '晚上';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface DemoTask {
  id: string;
  title: string;
  subject: string;
  slot: TaskSlot;
  durationMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  evidence: string;
  detail: string;
  deferReason?: string;
}

export const TASK_FIXTURES: DemoTask[] = [
  {
    id: 'task-method-01',
    title: '变量关系与实验设计',
    subject: '方法基础',
    slot: '上午',
    durationMinutes: 35,
    priority: 'high',
    status: 'in_progress',
    evidence: '完成 8 题，并记录 1 个易错点',
    detail: '从操作化、控制变量到内部效度，完成一组短练习。',
  },
  {
    id: 'task-reading-02',
    title: '研究摘要精读',
    subject: '研究阅读',
    slot: '下午',
    durationMinutes: 45,
    priority: 'medium',
    status: 'todo',
    evidence: '标注论点、证据与限制各 1 处',
    detail: '用证据卡片拆解一篇短摘要，形成可复用的阅读框架。',
  },
  {
    id: 'task-memory-03',
    title: '概念卡片复测',
    subject: '记忆复盘',
    slot: '晚上',
    durationMinutes: 25,
    priority: 'medium',
    status: 'todo',
    evidence: '完成两轮回忆并写下信心等级',
    detail: '优先处理临近到期的卡片，复测后决定是否继续观察。',
  },
  {
    id: 'task-writing-04',
    title: '主观题结构练习',
    subject: '表达训练',
    slot: '晚上',
    durationMinutes: 30,
    priority: 'low',
    status: 'todo',
    evidence: '输出观点、依据、例证三段结构',
    detail: '用结构模板完成一个限时回答，关注论点之间的连接。',
  },
  {
    id: 'task-review-05',
    title: '错题原因归类',
    subject: '错误复盘',
    slot: '下午',
    durationMinutes: 20,
    priority: 'high',
    status: 'done',
    evidence: '完成 1 条原因标签与修复动作',
    detail: '把错误归因到概念、审题、计算或表达，并留下下一步动作。',
  },
  {
    id: 'task-mock-06',
    title: '周测后证据整理',
    subject: '阶段检查',
    slot: '晚上',
    durationMinutes: 15,
    priority: 'low',
    status: 'deferred',
    evidence: '补齐分数、用时与反思三项证据',
    detail: '将阶段检查结果整理成下周计划可以读取的证据。',
  },
];

export interface ActivityPoint {
  label: string;
  minutes: number;
  accuracy: number;
}

export const ACTIVITY_FIXTURES: ActivityPoint[] = [
  { label: '一', minutes: 82, accuracy: 68 },
  { label: '二', minutes: 96, accuracy: 72 },
  { label: '三', minutes: 54, accuracy: 64 },
  { label: '四', minutes: 112, accuracy: 76 },
  { label: '五', minutes: 88, accuracy: 78 },
  { label: '六', minutes: 126, accuracy: 81 },
  { label: '日', minutes: 74, accuracy: 79 },
  { label: '一', minutes: 108, accuracy: 83 },
  { label: '二', minutes: 92, accuracy: 80 },
  { label: '三', minutes: 118, accuracy: 86 },
  { label: '四', minutes: 101, accuracy: 84 },
  { label: '五', minutes: 128, accuracy: 87 },
  { label: '六', minutes: 138, accuracy: 89 },
  { label: '今', minutes: 105, accuracy: 88 },
];

export const WEEKLY_DISTRIBUTION = [
  { label: '方法基础', value: 32, color: 'blue' },
  { label: '研究阅读', value: 24, color: 'teal' },
  { label: '记忆复盘', value: 20, color: 'amber' },
  { label: '表达训练', value: 14, color: 'coral' },
  { label: '阶段检查', value: 10, color: 'ink' },
] as const;

export const SUBJECT_INSIGHTS = [
  { name: '方法基础', accuracy: 86, trend: '+8%', tone: 'blue' },
  { name: '研究阅读', accuracy: 78, trend: '+5%', tone: 'teal' },
  { name: '记忆复盘', accuracy: 71, trend: '+11%', tone: 'amber' },
  { name: '表达训练', accuracy: 64, trend: '+3%', tone: 'coral' },
] as const;

export const REVIEW_PRESSURE = [38, 44, 41, 52, 47, 56, 49, 45, 43, 39, 36, 34, 31, 28];

export const DEFER_REASON_OPTIONS = [
  '时间冲突，需调整时段',
  '需要先补齐前置知识点',
  '状态不佳，改日完成',
] as const;

export interface Recommendation {
  title: string;
  summary: string;
  observations: string[];
  actionLabel: string;
  actionRoute: 'plan' | 'practice' | 'review' | 'insights';
}

export const RECOMMENDATION: Recommendation = {
  title: '优先把表达训练补上证据链',
  summary: '基于近两周的练习与复测记录，表达训练是唯一准确率低于 70% 的科目，且本周安排时长最少。',
  observations: [
    '表达训练准确率 64%，低于其余三个科目',
    '最近一次周测的失分集中在观点-依据-例证的连接上',
    '该科目本周仅安排 14% 的时长，与短板程度不匹配',
  ],
  actionLabel: '去计划里补一次结构练习',
  actionRoute: 'plan',
};

export interface QuizQuestion {
  id: string;
  number: number;
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  answer: string;
  explanation: string;
  knowledgePoint: string;
  difficulty: '基础' | '进阶';
}

export const QUIZ_FIXTURES: QuizQuestion[] = [
  {
    id: 'quiz-01',
    number: 1,
    category: '概念辨析',
    prompt: '在一项研究中，研究者通过统一指导语和相同测试时长来减少测量误差。这一做法最直接体现了什么？',
    options: ['增加样本数量', '控制测量条件', '提高变量数量', '延长研究周期'],
    correctIndex: 1,
    answer: '控制测量条件',
    explanation: '统一指导语与时长，是把测量条件固定下来，减少无关因素对结果的干扰。',
    knowledgePoint: '研究设计 · 测量控制',
    difficulty: '基础',
  },
  {
    id: 'quiz-02',
    number: 2,
    category: '情境应用',
    prompt: '某学习者发现自己在熟悉题型上正确率高，但换一种问法就容易失分。下一步最值得优先补充的证据是？',
    options: ['继续刷同一套题', '只记录最终分数', '比较不同表述下的解题过程', '立刻增加每日时长'],
    correctIndex: 2,
    answer: '比较不同表述下的解题过程',
    explanation: '比较过程证据能区分“记住答案”和“掌握概念”，帮助定位迁移问题。',
    knowledgePoint: '学习诊断 · 迁移证据',
    difficulty: '进阶',
  },
  {
    id: 'quiz-03',
    number: 3,
    category: '数据解读',
    prompt: '某周学习时长保持稳定，但复测正确率从 62% 升到 78%。最稳妥的判断是？',
    options: ['复习策略可能更有效', '已经完全掌握全部内容', '以后可以停止复测', '时长对结果没有影响'],
    correctIndex: 0,
    answer: '复习策略可能更有效',
    explanation: '在当前证据下，可以提出“策略可能更有效”的谨慎判断，但仍需持续观察和独立复测。',
    knowledgePoint: '证据判断 · 谨慎归因',
    difficulty: '进阶',
  },
];

export type ReviewStatus = 'due' | 'watch' | 'cleared';

export interface ReviewItem {
  id: string;
  title: string;
  subject: string;
  reason: string;
  stage: 0 | 1 | 2;
  status: ReviewStatus;
  dueLabel: string;
  confidence: number;
  attempts: number;
  lastResult: '待复测' | '通过一轮' | '已关闭' | '需重练';
}

export const REVIEW_FIXTURES: ReviewItem[] = [
  {
    id: 'review-01',
    title: '控制变量与内部效度',
    subject: '方法基础',
    reason: '同一概念在换问法时出现混淆',
    stage: 0,
    status: 'due',
    dueLabel: '今天到期',
    confidence: 2,
    attempts: 1,
    lastResult: '待复测',
  },
  {
    id: 'review-02',
    title: '摘要中的限制边界',
    subject: '研究阅读',
    reason: '能找结论，但遗漏证据范围',
    stage: 1,
    status: 'watch',
    dueLabel: '明天观察',
    confidence: 3,
    attempts: 2,
    lastResult: '通过一轮',
  },
  {
    id: 'review-03',
    title: '信度与效度的区分',
    subject: '记忆复盘',
    reason: '已完成两次独立复测',
    stage: 2,
    status: 'cleared',
    dueLabel: '已关闭',
    confidence: 4,
    attempts: 3,
    lastResult: '已关闭',
  },
];

export const CASE_STUDY_POINTS = [
  {
    number: '01',
    title: '把“今天学什么”变成下一步行动',
    text: '计划不是静态清单，而是根据可用时间、优先级和证据要求动态安排的行动队列。',
  },
  {
    number: '02',
    title: '把错题从收藏夹带回复习闭环',
    text: '错误不在提交后消失，而是经过原因归类、延迟复测和两次独立证据后才关闭。',
  },
  {
    number: '03',
    title: '让 AI 输出停在可核验的位置',
    text: '生成、反馈和诊断都需要来源、版本与人工确认；公开演示使用预生成示例，不伪装在线调用。',
  },
];
