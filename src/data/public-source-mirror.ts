/**
 * A deliberately fictional snapshot of the current learning-workbench shape.
 *
 * The private product is used only as a read-only product reference. This
 * module is the public project's sole fixture owner: names, counts, dates,
 * prompts, and statuses are invented and safe to publish.
 */

export const PUBLIC_DEMO_LABEL = '公开镜像 · 脱敏演示';

export const MIRROR_PROFILE = {
  learnerLabel: '匿名学习者',
  targetLabel: '综合备考主线',
  examDate: '2027-12-18',
  targetScore: 400,
  dailyMinMinutes: 180,
  dailyMinutes: 240,
  dailyMaxMinutes: 300,
  studyDaysPerWeek: 6,
  cardCapacity: 48,
  vocabularyCapacity: 36,
  phase: '基础巩固期',
  phaseLabel: '以教材理解、基础练习和记忆恢复为主',
} as const;

export const DAILY_CAPACITY_MINUTES = MIRROR_PROFILE.dailyMinutes;

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
  taskType: 'study' | 'practice' | 'review' | 'expression' | 'exam' | 'diagnosis';
  completionMode: 'self_report' | 'evidence';
  linkRoute: string;
  deferReason?: string;
}

export const TASK_FIXTURES: DemoTask[] = [
  {
    id: 'task-method-01', title: '核心概念精读', subject: '专业主线', slot: '上午',
    durationMinutes: 40, priority: 'high', status: 'in_progress',
    evidence: '完成一页结构笔记，并标出一个易混点',
    detail: '从定义、关系和典型例子三个层次整理一个章节片段。',
    taskType: 'study', completionMode: 'evidence', linkRoute: 'study-professional',
  },
  {
    id: 'task-reading-02', title: '材料结构拆解', subject: '语言训练', slot: '下午',
    durationMinutes: 45, priority: 'medium', status: 'todo',
    evidence: '标注论点、证据与限制各一处',
    detail: '用证据卡片拆解一段短材料，形成可复用的阅读框架。',
    taskType: 'study', completionMode: 'evidence', linkRoute: 'study-language',
  },
  {
    id: 'task-memory-03', title: '知识卡复测', subject: '记忆复盘', slot: '晚上',
    durationMinutes: 30, priority: 'medium', status: 'todo',
    evidence: '完成两轮回忆并留下信心等级',
    detail: '优先处理临近到期的卡片，复测后决定是否继续观察。',
    taskType: 'review', completionMode: 'evidence', linkRoute: 'review',
  },
  {
    id: 'task-writing-04', title: '主观表达练习', subject: '表达训练', slot: '晚上',
    durationMinutes: 35, priority: 'low', status: 'todo',
    evidence: '输出观点、依据、例证三段结构',
    detail: '用结构模板完成一个限时回答，关注论点之间的连接。',
    taskType: 'expression', completionMode: 'evidence', linkRoute: 'expression',
  },
  {
    id: 'task-review-05', title: '错题原因归类', subject: '错误复盘', slot: '下午',
    durationMinutes: 25, priority: 'high', status: 'done',
    evidence: '完成一条原因标签与修复动作',
    detail: '把错误归因到概念、审题、计算或表达，并留下下一步动作。',
    taskType: 'review', completionMode: 'evidence', linkRoute: 'wrong-questions',
  },
  {
    id: 'task-mock-06', title: '阶段测验证据整理', subject: '阶段检查', slot: '晚上',
    durationMinutes: 20, priority: 'low', status: 'deferred',
    evidence: '补齐分数、用时与反思三项证据',
    detail: '将阶段检查结果整理成下周计划可以读取的证据。',
    taskType: 'exam', completionMode: 'evidence', linkRoute: 'exam',
    deferReason: '状态不佳，改日完成',
  },
];

export interface ActivityPoint { label: string; minutes: number; accuracy: number; }

export const ACTIVITY_FIXTURES: ActivityPoint[] = [
  { label: '一', minutes: 96, accuracy: 68 }, { label: '二', minutes: 132, accuracy: 72 },
  { label: '三', minutes: 78, accuracy: 65 }, { label: '四', minutes: 164, accuracy: 76 },
  { label: '五', minutes: 148, accuracy: 78 }, { label: '六', minutes: 206, accuracy: 81 },
  { label: '日', minutes: 64, accuracy: 75 }, { label: '一', minutes: 180, accuracy: 80 },
  { label: '二', minutes: 152, accuracy: 79 }, { label: '三', minutes: 214, accuracy: 84 },
  { label: '四', minutes: 188, accuracy: 82 }, { label: '五', minutes: 226, accuracy: 86 },
  { label: '六', minutes: 194, accuracy: 88 }, { label: '今', minutes: 146, accuracy: 85 },
];

export const RECENT_SESSIONS = [
  { correct: 4, total: 5 }, { correct: 4, total: 5 }, { correct: 4, total: 5 },
  { correct: 5, total: 5 }, { correct: 5, total: 5 },
] as const;

export const WEEKLY_DISTRIBUTION = [
  { label: '专业主线', value: 34, color: 'blue' },
  { label: '语言训练', value: 24, color: 'teal' },
  { label: '记忆复盘', value: 19, color: 'amber' },
  { label: '表达训练', value: 13, color: 'coral' },
  { label: '阶段检查', value: 10, color: 'ink' },
] as const;

export const SUBJECT_INSIGHTS = [
  { name: '专业主线', accuracy: 82, trend: '+6%', tone: 'blue' },
  { name: '语言训练', accuracy: 76, trend: '+4%', tone: 'teal' },
  { name: '记忆复盘', accuracy: 71, trend: '+9%', tone: 'amber' },
  { name: '表达训练', accuracy: 64, trend: '+3%', tone: 'coral' },
] as const;

export const REVIEW_PRESSURE = [42, 48, 46, 55, 52, 58, 51, 49, 45, 43, 40, 36, 34, 31];

export const DEFER_REASON_OPTIONS = [
  '时间冲突，需调整时段', '需要先补齐前置知识点', '状态不佳，改日完成',
] as const;

export interface Recommendation {
  title: string;
  summary: string;
  observations: string[];
  actionLabel: string;
  actionRoute: string;
}

export const RECOMMENDATION: Recommendation = {
  title: '优先把表达训练补上证据链',
  summary: '基于近期练习与复测记录，表达训练仍是当前最需要补证据的轨道，且本周安排时长偏少。',
  observations: [
    '表达训练正确率 64%，低于其他轨道',
    '最近一次阶段测验的失分集中在观点与依据的连接上',
    '该轨道本周仅安排 13% 的时长，与当前短板不匹配',
  ],
  actionLabel: '去计划里补一次结构练习', actionRoute: 'plan',
};

export interface QuizQuestion {
  id: string; number: number; category: string; prompt: string; options: string[];
  correctIndex: number; answer: string; explanation: string; knowledgePoint: string;
  difficulty: '基础' | '进阶'; source: string; questionType: 'single' | 'multi' | 'short';
}

export const QUIZ_FIXTURES: QuizQuestion[] = [
  {
    id: 'quiz-01', number: 1, category: '概念辨析',
    prompt: '在一项研究中，研究者通过统一指导语和相同测试时长来减少测量误差。这一做法最直接体现了什么？',
    options: ['增加样本数量', '控制测量条件', '提高变量数量', '延长研究周期'],
    correctIndex: 1, answer: '控制测量条件',
    explanation: '统一指导语与时长，是把测量条件固定下来，减少无关因素对结果的干扰。',
    knowledgePoint: '研究设计 · 测量控制', difficulty: '基础', source: '固定示例题 · 来源已脱敏', questionType: 'single',
  },
  {
    id: 'quiz-02', number: 2, category: '情境应用',
    prompt: '某学习者在熟悉题型上正确率高，但换一种问法就容易失分。下一步最值得优先补充的证据是？',
    options: ['继续刷同一套题', '只记录最终分数', '比较不同表述下的解题过程', '立刻增加每日时长'],
    correctIndex: 2, answer: '比较不同表述下的解题过程',
    explanation: '比较过程证据能区分“记住答案”和“掌握概念”，帮助定位迁移问题。',
    knowledgePoint: '学习诊断 · 迁移证据', difficulty: '进阶', source: '固定示例题 · 来源已脱敏', questionType: 'single',
  },
  {
    id: 'quiz-03', number: 3, category: '数据解读',
    prompt: '某周学习时长保持稳定，但复测正确率从 62% 升到 78%。最稳妥的判断是？',
    options: ['复习策略可能更有效', '已经完全掌握全部内容', '以后可以停止复测', '时长对结果没有影响'],
    correctIndex: 0, answer: '复习策略可能更有效',
    explanation: '当前证据支持谨慎判断“策略可能更有效”，但仍需持续观察和独立复测。',
    knowledgePoint: '证据判断 · 谨慎归因', difficulty: '进阶', source: '固定示例题 · 来源已脱敏', questionType: 'single',
  },
];

export type ReviewStatus = 'due' | 'watch' | 'cleared';

export interface ReviewItem {
  id: string; title: string; subject: string; reason: string; stage: 0 | 1 | 2;
  status: ReviewStatus; dueLabel: string; confidence: number; attempts: number;
  lastResult: '待复测' | '通过一轮' | '已关闭' | '需重练';
  cardType: 'knowledge' | 'vocabulary'; chapter: string; intervalLabel: string;
}

export const REVIEW_FIXTURES: ReviewItem[] = [
  {
    id: 'review-01', title: '控制条件与结果解释', subject: '专业主线',
    reason: '同一概念在换问法时出现混淆', stage: 0, status: 'due', dueLabel: '今天到期',
    confidence: 2, attempts: 1, lastResult: '待复测', cardType: 'knowledge',
    chapter: '研究设计', intervalLabel: '间隔 1 天',
  },
  {
    id: 'review-02', title: '材料中的限制边界', subject: '语言训练',
    reason: '能找结论，但遗漏证据范围', stage: 1, status: 'watch', dueLabel: '明天观察',
    confidence: 3, attempts: 2, lastResult: '通过一轮', cardType: 'knowledge',
    chapter: '材料分析', intervalLabel: '间隔 2 天',
  },
  {
    id: 'review-03', title: '稳定性与有效性的区分', subject: '专业主线',
    reason: '已完成两次独立复测', stage: 2, status: 'cleared', dueLabel: '已关闭',
    confidence: 4, attempts: 3, lastResult: '已关闭', cardType: 'knowledge',
    chapter: '测量基础', intervalLabel: '已完成',
  },
];

export const STUDY_TRACKS = [
  { id: 'professional', route: 'study-professional', label: '专业主线', shortLabel: '主线', detail: '教材 → 知识点 → 微课 → 掌握验证', meta: '当前重点', tone: 'blue' },
  { id: 'language', route: 'study-language', label: '语言训练', shortLabel: '语言', detail: '词汇、阅读、翻译与写作', meta: '独立轨道', tone: 'teal' },
  { id: 'foundation', route: 'study-foundation', label: '公共基础', shortLabel: '基础', detail: '知识学习、客观题与分析题', meta: '独立轨道', tone: 'amber' },
] as const;

export interface StudyChapter {
  id: string; trackId: string; title: string; subtitle: string; points: number;
  mastered: number; learning: number; review: number; microLessons: number;
  status: 'active' | 'queued' | 'done';
}

export const STUDY_CHAPTERS: StudyChapter[] = [
  { id: 'pro-01', trackId: 'professional', title: '基础概念与研究框架', subtitle: '从定义到关系图', points: 18, mastered: 11, learning: 5, review: 2, microLessons: 6, status: 'active' },
  { id: 'pro-02', trackId: 'professional', title: '研究设计与证据', subtitle: '变量、控制与解释', points: 16, mastered: 8, learning: 6, review: 2, microLessons: 5, status: 'active' },
  { id: 'pro-03', trackId: 'professional', title: '数据理解与测量', subtitle: '稳定性、有效性与判断', points: 14, mastered: 4, learning: 7, review: 3, microLessons: 4, status: 'queued' },
  { id: 'pro-04', trackId: 'professional', title: '应用与综合表达', subtitle: '从知识点到完整回答', points: 12, mastered: 2, learning: 6, review: 4, microLessons: 3, status: 'queued' },
  { id: 'lang-01', trackId: 'language', title: '高频词汇与语境', subtitle: '词义、搭配与迁移', points: 24, mastered: 15, learning: 6, review: 3, microLessons: 8, status: 'active' },
  { id: 'lang-02', trackId: 'language', title: '阅读结构识别', subtitle: '论点、证据与转折', points: 20, mastered: 9, learning: 8, review: 3, microLessons: 6, status: 'active' },
  { id: 'lang-03', trackId: 'language', title: '表达与改写', subtitle: '翻译和写作的结构练习', points: 15, mastered: 5, learning: 7, review: 3, microLessons: 4, status: 'queued' },
  { id: 'base-01', trackId: 'foundation', title: '基本概念地图', subtitle: '建立公共基础框架', points: 22, mastered: 13, learning: 6, review: 3, microLessons: 7, status: 'active' },
  { id: 'base-02', trackId: 'foundation', title: '常见题型与辨析', subtitle: '选择题到分析题', points: 18, mastered: 7, learning: 8, review: 3, microLessons: 5, status: 'active' },
  { id: 'base-03', trackId: 'foundation', title: '阶段回顾与表达', subtitle: '用证据检查掌握', points: 13, mastered: 3, learning: 6, review: 4, microLessons: 3, status: 'queued' },
];

export interface KnowledgePoint {
  id: string; chapterId: string; title: string; detail: string;
  status: 'unseen' | 'learning' | 'review' | 'mastered'; evidence: string; sourceLabel: string;
}

export const KNOWLEDGE_POINTS: KnowledgePoint[] = [
  { id: 'point-01', chapterId: 'pro-01', title: '概念的操作化', detail: '把抽象概念转化为可观察、可记录的指标。', status: 'mastered', evidence: '独立解释 3 次', sourceLabel: '固定示例 · 章节摘要' },
  { id: 'point-02', chapterId: 'pro-01', title: '变量之间的关系', detail: '区分相关、预测与因果解释的证据边界。', status: 'learning', evidence: '完成 2 次练习', sourceLabel: '固定示例 · 章节摘要' },
  { id: 'point-03', chapterId: 'pro-02', title: '控制无关因素', detail: '通过统一条件和对照设计降低干扰。', status: 'review', evidence: '最近一次复测答错', sourceLabel: '固定示例 · 章节摘要' },
  { id: 'point-04', chapterId: 'pro-02', title: '证据与结论范围', detail: '结论强度应与样本、测量和设计证据匹配。', status: 'learning', evidence: '待完成迁移练习', sourceLabel: '固定示例 · 章节摘要' },
  { id: 'point-05', chapterId: 'pro-03', title: '稳定性指标', detail: '观察同一测量在不同时间或条件下的一致程度。', status: 'unseen', evidence: '尚无有效作答', sourceLabel: '固定示例 · 章节摘要' },
  { id: 'point-06', chapterId: 'lang-01', title: '语境中的词义', detail: '结合上下文判断词义，而不是只背单一释义。', status: 'review', evidence: '今日到期 6 条', sourceLabel: '固定示例 · 语料片段' },
  { id: 'point-07', chapterId: 'lang-02', title: '段落论证结构', detail: '识别主张、依据、转折和限制之间的关系。', status: 'learning', evidence: '完成 1 次结构标注', sourceLabel: '固定示例 · 材料片段' },
  { id: 'point-08', chapterId: 'base-01', title: '框架化记忆', detail: '先建立概念关系，再用题目检查提取质量。', status: 'mastered', evidence: '两次独立复测通过', sourceLabel: '固定示例 · 章节摘要' },
];

export const PRACTICE_ENTRY_POINTS = [
  { id: 'type', route: 'practice', label: '按题型练习', detail: '选择科目、章节、题型和数量，开始一组可追踪练习。', count: '4 种题型', tone: 'blue' },
  { id: 'past', route: 'past-exams', label: '历年试题', detail: '按年份和模块查看完整试题，并把错题带回复盘。', count: '多年份', tone: 'teal' },
  { id: 'mock', route: 'exam', label: '模拟考试', detail: '带草稿恢复、计时、逐题反馈和交卷后的补救动作。', count: '计时模式', tone: 'amber' },
] as const;

export const SUBJECT_FILTERS = ['全部科目', '专业主线', '语言训练', '公共基础'] as const;

export const WRONG_QUESTION_FIXTURES = [
  { id: 'wrong-01', title: '控制条件与结果解释', subject: '专业主线', chapter: '研究设计与证据', reason: '概念边界混淆', lastSeen: '今天', due: true, attempts: 1, action: '对比两个相似情境并写出差异' },
  { id: 'wrong-02', title: '材料中的限制边界', subject: '语言训练', chapter: '阅读结构识别', reason: '遗漏限制条件', lastSeen: '昨天', due: true, attempts: 2, action: '重新标注结论的适用范围' },
  { id: 'wrong-03', title: '阶段数据的谨慎归因', subject: '公共基础', chapter: '阶段回顾与表达', reason: '把相关当成因果', lastSeen: '3 天前', due: false, attempts: 2, action: '补写一条证据不足的说明' },
  { id: 'wrong-04', title: '观点与依据的连接', subject: '表达训练', chapter: '应用与综合表达', reason: '结构断点', lastSeen: '5 天前', due: false, attempts: 1, action: '完成一版三段式重写' },
] as const;

export const EXPRESSION_FIXTURES = [
  {
    id: 'expression-01', taskType: '结构化简答', subject: '专业主线', title: '如何判断一条学习结论是否可靠？',
    source: '固定示例 · 可信来源边界已脱敏', prompt: '请用“主张—依据—限制”三段结构，说明判断学习结论可靠性时应检查什么。',
    reference: ['是否明确了观察对象和指标', '证据是否足以支持当前强度的结论', '是否说明了样本、测量或设计的限制'],
    status: 'needs_revision' as const, draft: '我会先看有没有数据，再看结论是否合理，最后看有没有例外。',
    feedback: '方向正确，但“数据”“合理”“例外”仍然过于宽泛，需要把每一步写成可核验的检查动作。', revisions: 1,
  },
  {
    id: 'expression-02', taskType: '材料分析', subject: '语言训练', title: '指出材料主张与证据之间的关系',
    source: '固定示例 · 材料片段已脱敏', prompt: '先写出材料主张，再指出支持主张的证据和仍需保留的限制。',
    reference: ['主张与证据一一对应', '区分事实、解释与推测', '保留证据无法覆盖的范围'],
    status: 'accepted' as const, draft: '主张是策略可能有效，证据是复测正确率上升，限制是样本还不够。',
    feedback: '已覆盖主要采分点，能够把结论强度和证据边界对应起来。', revisions: 2,
  },
] as const;

export const EXAM_FIXTURES = [
  { id: 'exam-sprint-01', label: '阶段综合测验', subject: '综合训练', year: '示例卷 A', questions: 20, minutes: 45, answered: 7, status: 'draft' as const, score: null, detail: '覆盖概念辨析、材料分析和简答表达。' },
  { id: 'exam-weekly-02', label: '周度检核', subject: '专业主线', year: '示例卷 B', questions: 12, minutes: 25, answered: 12, status: 'finished' as const, score: 9, detail: '已保存逐题反馈，可回到错题和表达训练。' },
  { id: 'exam-language-03', label: '语言模块测验', subject: '语言训练', year: '示例卷 C', questions: 15, minutes: 30, answered: 0, status: 'ready' as const, score: null, detail: '适合在完成词汇路线后进行一次完整检核。' },
] as const;

export const ANALYTICS_DATA = {
  totalAnswers: 128, totalReviews: 214, overallAccuracy: 78,
  subjectAccuracy: [
    { subject: '专业主线', total: 48, correct: 39 }, { subject: '语言训练', total: 36, correct: 27 },
    { subject: '公共基础', total: 29, correct: 23 }, { subject: '表达训练', total: 15, correct: 10 },
  ],
  weakPoints: [
    { subject: '表达训练', title: '观点与依据的连接', attempts: 6, accuracy: 50 },
    { subject: '专业主线', title: '控制条件与结果解释', attempts: 8, accuracy: 63 },
    { subject: '语言训练', title: '限制范围识别', attempts: 7, accuracy: 64 },
  ],
  radarData: [
    { subject: '理解', progress: 78, mastery: 70, accuracy: 82 }, { subject: '记忆', progress: 65, mastery: 58, accuracy: 71 },
    { subject: '迁移', progress: 54, mastery: 48, accuracy: 64 }, { subject: '表达', progress: 46, mastery: 42, accuracy: 64 },
    { subject: '复盘', progress: 72, mastery: 68, accuracy: 79 },
  ],
} as const;

export const DIAGNOSIS_STEPS = [
  { id: 'baseline', label: '基线样本', detail: '确认不同轨道是否都有足够的独立作答证据。', status: 'done' as const },
  { id: 'pattern', label: '模式识别', detail: '区分概念问题、迁移问题和表达结构问题。', status: 'active' as const },
  { id: 'action', label: '行动建议', detail: '把诊断结果转成下一轮计划中的可执行任务。', status: 'pending' as const },
] as const;

export const CONTENT_REVIEW_ITEMS = [
  { id: 'content-01', type: '章节摘要', title: '基础概念与研究框架', status: 'reviewing', risk: '中', source: '固定示例 · 版本 2', updated: '今天 09:20' },
  { id: 'content-02', type: '练习解析', title: '控制条件与结果解释', status: 'approved', risk: '低', source: '固定示例 · 版本 1', updated: '昨天 16:40' },
  { id: 'content-03', type: '材料片段', title: '主张与证据范围', status: 'frozen', risk: '低', source: '固定示例 · 版本 3', updated: '3 天前' },
  { id: 'content-04', type: '微课卡片', title: '稳定性与有效性', status: 'draft', risk: '高', source: '固定示例 · 待补来源', updated: '5 天前' },
] as const;

export const CASE_STUDY_POINTS = [
  { number: '01', title: '把真实导航变成一条学习闭环', text: '公开镜像保留首页、计划、学习、练习、复盘、数据与诊断、系统与目标的真实关系，让用户能看到产品如何组织学习，而不只看到几个孤立页面。' },
  { number: '02', title: '把任务证据带回后续决策', text: '计划动作、练习反馈、复测状态、错题原因和主观重写共同构成下一步依据；公开数据是虚构的，但状态关系与工作流保持一致。' },
  { number: '03', title: '把私有系统边界说清楚', text: '本项目只呈现经过泛化的产品结构与固定演示状态，不连接数据库、认证、模型或任何私有运行环境。' },
];
