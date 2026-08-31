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

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'deferred' | 'skipped';
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
  { id: 'pro-01', trackId: 'professional', title: '基础概念与研究框架', subtitle: '从定义到关系图', points: 5, mastered: 1, learning: 2, review: 1, microLessons: 5, status: 'active' },
  { id: 'pro-02', trackId: 'professional', title: '研究设计与证据', subtitle: '变量、控制与解释', points: 4, mastered: 0, learning: 1, review: 1, microLessons: 4, status: 'active' },
  { id: 'pro-03', trackId: 'professional', title: '数据理解与测量', subtitle: '稳定性、有效性与判断', points: 4, mastered: 0, learning: 2, review: 0, microLessons: 4, status: 'queued' },
  { id: 'lang-01', trackId: 'language', title: '高频词汇与语境', subtitle: '词义、搭配与迁移', points: 5, mastered: 0, learning: 2, review: 1, microLessons: 5, status: 'active' },
  { id: 'lang-02', trackId: 'language', title: '阅读结构识别', subtitle: '论点、证据与转折', points: 5, mastered: 0, learning: 2, review: 1, microLessons: 5, status: 'active' },
  { id: 'lang-03', trackId: 'language', title: '表达与改写', subtitle: '翻译和写作的结构练习', points: 5, mastered: 0, learning: 2, review: 1, microLessons: 5, status: 'queued' },
  { id: 'base-01', trackId: 'foundation', title: '基本概念地图', subtitle: '建立公共基础框架', points: 5, mastered: 1, learning: 2, review: 1, microLessons: 5, status: 'active' },
  { id: 'base-02', trackId: 'foundation', title: '常见题型与辨析', subtitle: '选择题到分析题', points: 5, mastered: 1, learning: 2, review: 1, microLessons: 5, status: 'active' },
  { id: 'base-03', trackId: 'foundation', title: '阶段回顾与表达', subtitle: '用证据检查掌握', points: 5, mastered: 0, learning: 2, review: 1, microLessons: 5, status: 'queued' },
];

export interface KnowledgePoint {
  id: string; chapterId: string; title: string; detail: string;
  status: 'unseen' | 'learning' | 'review' | 'mastered'; evidence: string; sourceLabel: string;
  keywords: string[]; importance: 1 | 2 | 3; difficulty: '基础' | '进阶';
}

type RawKnowledgePoint = [
  id: string, chapterId: string, title: string, detail: string,
  status: KnowledgePoint['status'], evidence: string, sourceLabel: string,
  keywords: string[], importance: 1 | 2 | 3, difficulty: '基础' | '进阶',
];

const RAW_KNOWLEDGE_POINTS: RawKnowledgePoint[] = [
  ['point-01', 'pro-01', '概念的操作化', '把抽象概念转化为可观察、可记录的指标。', 'mastered', '独立解释 3 次', '固定示例 · 章节摘要', ['操作定义', '指标', '可观察'], 3, '基础'],
  ['point-02', 'pro-01', '变量之间的关系', '区分相关、预测与因果解释的证据边界。', 'learning', '完成 2 次练习', '固定示例 · 章节摘要', ['相关', '因果', '证据边界'], 3, '进阶'],
  ['point-03', 'pro-02', '控制无关因素', '通过统一条件和对照设计降低干扰。', 'review', '最近一次复测答错', '固定示例 · 章节摘要', ['控制条件', '对照', '测量误差'], 3, '基础'],
  ['point-04', 'pro-02', '证据与结论范围', '结论强度应与样本、测量和设计证据匹配。', 'learning', '待完成迁移练习', '固定示例 · 章节摘要', ['结论强度', '样本', '限制'], 3, '进阶'],
  ['point-05', 'pro-03', '稳定性指标', '观察同一测量在不同时间或条件下的一致程度。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['稳定性', '一致性', '重复测量'], 2, '基础'],
  ['point-06', 'pro-01', '研究假设的表述', '用可检验的方式陈述变量之间的预期关系。', 'learning', '完成 1 次表述练习', '固定示例 · 章节摘要', ['假设', '可检验', '预期关系'], 2, '基础'],
  ['point-07', 'pro-02', '对照设计的价值', '通过比较组排除备择解释，而不只是增加样本。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['对照组', '备择解释', '设计'], 3, '进阶'],
  ['point-08', 'pro-03', '有效性的基本判断', '从内容和证据覆盖判断测量是否真的量到了目标概念。', 'learning', '完成 1 次判断练习', '固定示例 · 章节摘要', ['有效性', '内容覆盖', '测量目标'], 2, '基础'],
  ['point-09', 'pro-03', '数据中的异常值', '先检查记录错误和条件差异，再决定是否排除数据。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['异常值', '检查', '排除'], 2, '进阶'],
  ['point-10', 'pro-01', '关系图与概念边界', '用关系图整理定义，并标出概念不适用的边界。', 'review', '关系图缺一条边界', '固定示例 · 章节摘要', ['关系图', '边界', '概念'], 2, '基础'],
  ['point-11', 'lang-01', '语境中的词义', '结合上下文判断词义，而不是只背单一释义。', 'review', '今日到期 6 条', '固定示例 · 语料片段', ['词义', '语境', '搭配'], 3, '基础'],
  ['point-12', 'lang-01', '高频搭配的迁移', '把已掌握的搭配用到新句子中，并检查是否自然。', 'learning', '完成 1 组迁移', '固定示例 · 语料片段', ['搭配', '迁移', '自然表达'], 2, '进阶'],
  ['point-13', 'lang-01', '近义词的边界', '从语体、强度和搭配区分近义词。', 'unseen', '尚无有效作答', '固定示例 · 语料片段', ['近义词', '语体', '强度'], 2, '基础'],
  ['point-14', 'lang-01', '长句的信息分层', '把主句、从句和修饰成分分成可检查的信息层。', 'learning', '完成 1 次分层', '固定示例 · 语料片段', ['长句', '主句', '信息层'], 2, '进阶'],
  ['point-15', 'lang-01', '语境推断生词', '用前后句和连接词推断生词的大致含义。', 'unseen', '尚无有效作答', '固定示例 · 语料片段', ['推断', '连接词', '上下文'], 2, '基础'],
  ['point-16', 'lang-02', '段落论证结构', '识别主张、依据、转折和限制之间的关系。', 'learning', '完成 1 次结构标注', '固定示例 · 材料片段', ['主张', '依据', '转折'], 3, '基础'],
  ['point-17', 'lang-02', '证据的强度分级', '区分个例、统计和对照证据对结论的支持强度。', 'learning', '完成 2 次分级', '固定示例 · 材料片段', ['证据强度', '个例', '对照'], 2, '进阶'],
  ['point-18', 'lang-02', '转折词的功能', '用转折词定位作者真正想强调的判断。', 'unseen', '尚无有效作答', '固定示例 · 材料片段', ['转折词', '强调', '定位'], 2, '基础'],
  ['point-19', 'lang-02', '作者态度的推断', '从措辞强度和限定语推断作者对结论的把握。', 'unseen', '尚无有效作答', '固定示例 · 材料片段', ['态度', '限定语', '措辞'], 2, '进阶'],
  ['point-20', 'lang-02', '段落主旨的复述', '用自己的话复述主旨，并与原句逐点核对。', 'review', '复述遗漏限制条件', '固定示例 · 材料片段', ['主旨', '复述', '核对'], 2, '基础'],
  ['point-21', 'lang-03', '表达中的结构模板', '用主张—依据—限制组织短回答，避免只给结论。', 'learning', '完成 1 版模板', '固定示例 · 表达样本', ['结构', '主张', '限制'], 3, '基础'],
  ['point-22', 'lang-03', '翻译中的信息保留', '先核对信息是否完整，再检查表达是否通顺。', 'unseen', '尚无有效作答', '固定示例 · 表达样本', ['翻译', '信息保留', '通顺'], 2, '基础'],
  ['point-23', 'lang-03', '写作中的连贯手段', '用指代和连接词让相邻句子之间的关系清楚。', 'learning', '完成 1 次润色', '固定示例 · 表达样本', ['连贯', '指代', '连接词'], 2, '进阶'],
  ['point-24', 'lang-03', '冗余表达的删除', '删除重复修饰，保留唯一且必要的信息。', 'unseen', '尚无有效作答', '固定示例 · 表达样本', ['冗余', '删减', '必要信息'], 2, '基础'],
  ['point-25', 'lang-03', '观点与例子的对应', '每个例子都要回到观点，避免例子脱离论证。', 'review', '例证对应错位', '固定示例 · 表达样本', ['观点', '例子', '对应'], 2, '进阶'],
  ['point-26', 'base-01', '框架化记忆', '先建立概念关系，再用题目检查提取质量。', 'mastered', '两次独立复测通过', '固定示例 · 章节摘要', ['框架', '提取', '检查'], 3, '基础'],
  ['point-27', 'base-01', '概念地图的搭建', '从核心概念出发逐层展开，并标注概念间连线。', 'learning', '完成 1 张地图', '固定示例 · 章节摘要', ['概念地图', '层级', '连线'], 2, '基础'],
  ['point-28', 'base-01', '记忆线索的生成', '把抽象条目转成可回忆的线索，而不是反复抄写。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['线索', '回忆', '编码'], 2, '进阶'],
  ['point-29', 'base-01', '易混概念的对照表', '用共同点和差异点组织容易混淆的概念。', 'review', '对照表缺一个共同点', '固定示例 · 章节摘要', ['对照', '易混', '差异'], 2, '基础'],
  ['point-30', 'base-01', '复习间隔的检查', '在遗忘前安排一次主动回忆，再决定是否延后。', 'learning', '完成 1 次间隔检查', '固定示例 · 章节摘要', ['间隔', '主动回忆', '延后'], 2, '进阶'],
  ['point-31', 'base-02', '选择题的题干拆解', '先定位提问对象，再排除与提问无关的选项。', 'learning', '完成 2 次拆解', '固定示例 · 章节摘要', ['题干', '提问对象', '排除'], 3, '基础'],
  ['point-32', 'base-02', '绝对化选项的识别', '对“一定、全部、从不”等绝对化表述保持警惕。', 'mastered', '独立判断 4 次', '固定示例 · 章节摘要', ['绝对化', '警惕', '判断'], 2, '基础'],
  ['point-33', 'base-02', '分析题的采分结构', '先列出可核验的要点，再逐点展开说明。', 'learning', '完成 1 次列点', '固定示例 · 章节摘要', ['采分点', '列点', '展开'], 3, '进阶'],
  ['point-34', 'base-02', '材料题的证据定位', '回到材料找到支撑句，避免凭印象作答。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['材料', '定位', '支撑句'], 2, '基础'],
  ['point-35', 'base-02', '多选题的精确比较', '逐项与题干要求比较，而不是凭感觉多选。', 'review', '漏选 1 个正确项', '固定示例 · 章节摘要', ['多选题', '比较', '漏选'], 2, '进阶'],
  ['point-36', 'base-03', '阶段回顾的清单', '按理解、记忆、迁移、表达四类检查阶段证据。', 'learning', '完成 1 份清单', '固定示例 · 章节摘要', ['回顾', '清单', '证据'], 2, '基础'],
  ['point-37', 'base-03', '薄弱点的证据分级', '用作答次数和正确率判断薄弱点是否稳定。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['薄弱点', '作答次数', '正确率'], 2, '进阶'],
  ['point-38', 'base-03', '表达与理解的区别', '能解释不等于能写出结构完整的答案。', 'learning', '完成 1 次对比', '固定示例 · 章节摘要', ['解释', '表达', '完整答案'], 2, '基础'],
  ['point-39', 'base-03', '下一步的优先级', '按到期、薄弱和计划容量排定下一步，而不是都做。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['优先级', '到期', '容量'], 3, '进阶'],
  ['point-40', 'base-03', '阶段测验的复盘', '先区分错因类型，再决定补概念还是补表达。', 'review', '错因归类不完整', '固定示例 · 章节摘要', ['复盘', '错因', '补救'], 2, '基础'],
  ['point-41', 'pro-02', '样本与结论的关系', '样本规模和来源决定结论可以推广的范围。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['样本', '推广范围', '结论'], 3, '进阶'],
  ['point-42', 'pro-03', '测量误差的来源', '区分随机误差和系统误差对结果的影响。', 'learning', '完成 1 次区分', '固定示例 · 章节摘要', ['随机误差', '系统误差', '影响'], 2, '基础'],
  ['point-43', 'pro-01', '理论概念与日常概念', '识别同一词汇在理论语境与日常语境中的不同含义。', 'unseen', '尚无有效作答', '固定示例 · 章节摘要', ['理论概念', '日常概念', '语境'], 2, '进阶'],
  ['point-44', 'lang-03', '修改稿的对照检查', '逐点对照上一版反馈，确认每一条是否已经处理。', 'unseen', '尚无有效作答', '固定示例 · 表达样本', ['修改稿', '反馈', '对照'], 2, '基础'],
  ['point-45', 'base-02', '答题时间的分配', '按分值和题型预留时间，避免在单题上超时。', 'learning', '完成 1 次时间计划', '固定示例 · 章节摘要', ['时间', '分值', '题型'], 2, '基础'],
];

export const KNOWLEDGE_POINTS: KnowledgePoint[] = RAW_KNOWLEDGE_POINTS.map(([id, chapterId, title, detail, status, evidence, sourceLabel, keywords, importance, difficulty]) => ({
  id, chapterId, title, detail, status, evidence, sourceLabel, keywords, importance, difficulty,
}));

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

/* ---------- Deep core-loop fixtures (synthetic, privacy-safe) ---------- */

export type PracticeTrackId = 'professional' | 'language' | 'foundation';
export type PracticeQuestionType = 'single' | 'multi' | 'short' | 'verbatim';

export interface PracticeQuestion {
  id: string;
  type: PracticeQuestionType;
  trackId: PracticeTrackId;
  chapterId: string;
  knowledgePointId: string;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctIndexes?: number[];
  answer: string;
  explanation: string;
  scoringPoints?: string[];
  keywords?: string[];
  expectedLines?: string[];
  expectedLength?: number;
  difficulty: '基础' | '进阶';
  sourceLabel: string;
}

const DEFAULT_SINGLE_META: Array<{ trackId: PracticeTrackId; chapterId: string; knowledgePointId: string }> = [
  { trackId: 'professional', chapterId: 'pro-02', knowledgePointId: 'point-03' },
  { trackId: 'professional', chapterId: 'pro-02', knowledgePointId: 'point-04' },
  { trackId: 'foundation', chapterId: 'base-03', knowledgePointId: 'point-37' },
];

const EXTRA_SINGLE_QUESTIONS: PracticeQuestion[] = [
  { id: 'quiz-04', type: 'single', trackId: 'professional', chapterId: 'pro-01', knowledgePointId: 'point-01', prompt: '把“学习投入”转化为可观察指标，最合适的是？', options: ['记录每日有效学习分钟', '感觉自己更努力了', '多买几本资料', '偶尔回想学习内容'], correctIndex: 0, answer: '记录每日有效学习分钟', explanation: '操作化要求把概念转成可观察、可记录的指标。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-05', type: 'single', trackId: 'professional', chapterId: 'pro-01', knowledgePointId: 'point-02', prompt: '两个变量一起变化，是否可以立即下因果结论？', options: ['可以，只要数值同步', '不可以，还需排除其他解释', '可以，样本大就行', '不可以，因为数字不可信'], correctIndex: 1, answer: '不可以，还需排除其他解释', explanation: '相关只是因果的必要候选之一，还需要设计和对照证据。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-06', type: 'single', trackId: 'professional', chapterId: 'pro-03', knowledgePointId: 'point-08', prompt: '一道测量题只覆盖了概念的某个侧面，这主要影响？', options: ['测量有效性', '字体美观', '题目数量', '考试时长'], correctIndex: 0, answer: '测量有效性', explanation: '有效性关心测量是否真的覆盖目标概念。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-07', type: 'single', trackId: 'language', chapterId: 'lang-01', knowledgePointId: 'point-11', prompt: '遇到熟悉词但句意不通，优先做什么？', options: ['查该词在上下文中的搭配', '只看词的第一个释义', '跳过整个句子', '直接换一个词'], correctIndex: 0, answer: '查该词在上下文中的搭配', explanation: '词义受语境和搭配约束，需结合上下文判断。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-08', type: 'single', trackId: 'language', chapterId: 'lang-02', knowledgePointId: 'point-16', prompt: '一段材料先陈述观点再给出统计依据，最后指出样本较小。最后一句的作用是？', options: ['重复观点', '说明证据限制', '否定全部结论', '增加情感色彩'], correctIndex: 1, answer: '说明证据限制', explanation: '限制句界定结论可以成立的证据范围。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-09', type: 'single', trackId: 'language', chapterId: 'lang-02', knowledgePointId: 'point-17', prompt: '支持结论的证据中，通常哪种强度最高？', options: ['单个成功个例', '设计良好的对照结果', '朋友的经验', '未经检验的推测'], correctIndex: 1, answer: '设计良好的对照结果', explanation: '对照设计能排除更多备择解释，证据强度更高。', difficulty: '进阶', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-10', type: 'single', trackId: 'foundation', chapterId: 'base-02', knowledgePointId: 'point-31', prompt: '做选择题时，读完题干后第一步是？', options: ['定位提问对象', '凭印象选第一个', '选最长的选项', '先看解析'], correctIndex: 0, answer: '定位提问对象', explanation: '先明确题目在问什么，再逐项排除无关选项。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-11', type: 'single', trackId: 'foundation', chapterId: 'base-02', knowledgePointId: 'point-32', prompt: '选项中包含“一定不会发生”这类绝对化表述时，应如何处理？', options: ['优先选择它', '保持警惕并核对条件', '直接排除题目', '忽略其他选项'], correctIndex: 1, answer: '保持警惕并核对条件', explanation: '绝对化表述常常超过证据能支持的范围。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'quiz-12', type: 'single', trackId: 'foundation', chapterId: 'base-03', knowledgePointId: 'point-39', prompt: '今天计划已满，但还有一道到期复习卡，最合理的处理是？', options: ['忽略容量继续加任务', '按优先级替换低优先任务', '全部放弃复习', '只看不记结果'], correctIndex: 1, answer: '按优先级替换低优先任务', explanation: '容量约束下应调整优先级，而不是无视约束。', difficulty: '进阶', sourceLabel: '固定示例题 · 来源已脱敏' },
];

const MULTI_QUESTIONS: PracticeQuestion[] = [
  { id: 'multi-01', type: 'multi', trackId: 'professional', chapterId: 'pro-02', knowledgePointId: 'point-03', prompt: '下列哪些做法有助于控制无关因素？', options: ['统一测量条件', '设置对照比较', '随机更换题目规则', '记录可能影响结果的背景信息'], correctIndexes: [0, 1, 3], answer: 'ABD', explanation: '统一条件、对照比较和记录背景信息都能减少无关因素干扰；随意更换规则会引入新的混淆。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'multi-02', type: 'multi', trackId: 'professional', chapterId: 'pro-03', knowledgePointId: 'point-42', prompt: '关于随机误差与系统误差，正确的说法有哪些？', options: ['随机误差可以通过重复测量评估', '系统误差会稳定地偏向某一方向', '系统误差靠增加题目数量就能消除', '两类误差对结论的影响方式不同'], correctIndexes: [0, 1, 3], answer: 'ABD', explanation: '重复测量有助于评估随机误差；系统误差需要修正条件或校准，不是靠数量消除。', difficulty: '进阶', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'multi-03', type: 'multi', trackId: 'language', chapterId: 'lang-02', knowledgePointId: 'point-16', prompt: '识别一段论证时，需要同时定位哪些成分？', options: ['主张', '支持依据', '限制条件', '字体格式'], correctIndexes: [0, 1, 2], answer: 'ABC', explanation: '主张、依据和限制共同构成可核验的论证结构。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
  { id: 'multi-04', type: 'multi', trackId: 'foundation', chapterId: 'base-02', knowledgePointId: 'point-35', prompt: '做多选题时，哪些做法能减少漏选？', options: ['逐项与题干要求比较', '检查已选组合是否完整覆盖要求', '凭第一印象快速交卷', '用排除法处理明显无关项'], correctIndexes: [0, 1, 3], answer: 'ABD', explanation: '逐项比较、组合检查和排除法都能提高多选题稳定性。', difficulty: '基础', sourceLabel: '固定示例题 · 来源已脱敏' },
];

const SHORT_QUESTIONS: PracticeQuestion[] = [
  { id: 'short-01', type: 'short', trackId: 'professional', chapterId: 'pro-02', knowledgePointId: 'point-04', prompt: '请用“主张—依据—限制”结构，说明为什么一次阶段测验分数提高不能直接证明方法有效。', answer: '主张：分数提高可能与方法改进有关，但不能直接证明因果。依据：缺少对照条件和其他可能解释的证据。限制：样本只有一次测验，测量范围有限。', explanation: '要点是控制备择解释、区分相关与因果、说明证据边界。', scoringPoints: ['提到不能直接证明因果', '提到缺少对照或其他解释', '提到样本或测量范围限制'], keywords: ['因果', '对照', '限制', '样本', '证据'], expectedLength: 120, difficulty: '进阶', sourceLabel: '固定示例题 · 采分点已脱敏' },
  { id: 'short-02', type: 'short', trackId: 'professional', chapterId: 'pro-01', knowledgePointId: 'point-01', prompt: '请举例说明什么是“把概念操作化”。', answer: '操作化是把抽象概念转成可观察、可记录的指标，例如用每日有效学习分钟和独立作答次数来记录“投入”。', explanation: '示例应包含概念、指标和记录方式三层。', scoringPoints: ['给出可观察指标', '说明记录或测量方式', '例子与目标概念对应'], keywords: ['指标', '记录', '观察', '概念'], expectedLength: 80, difficulty: '基础', sourceLabel: '固定示例题 · 采分点已脱敏' },
  { id: 'short-03', type: 'short', trackId: 'language', chapterId: 'lang-02', knowledgePointId: 'point-20', prompt: '请用一句话复述材料主旨，并注明主旨没有覆盖的限制。', answer: '核心判断：策略在现有样本中表现出改善迹象；限制：尚不能推广到其他条件。', explanation: '复述要保留结论强度，并明确证据不能覆盖的范围。', scoringPoints: ['复述出核心判断', '保留结论强度的限定', '写出未覆盖范围'], keywords: ['判断', '改善', '样本', '限制', '不能'], expectedLength: 60, difficulty: '基础', sourceLabel: '固定示例题 · 采分点已脱敏' },
  { id: 'short-04', type: 'short', trackId: 'foundation', chapterId: 'base-03', knowledgePointId: 'point-37', prompt: '某个知识点最近 6 次练习只对了 2 次，请说明判断它是否属于稳定薄弱点还需要什么。', answer: '还需要看错误原因是否一致、题目难度是否可比、以及在不同时间是否重复出现同类错误。', explanation: '薄弱点判断需要次数、稳定性和错因三方面证据。', scoringPoints: ['提到错误原因是否一致', '提到题目或条件是否可比', '提到不同时间的重复性'], keywords: ['原因', '难度', '重复', '时间', '稳定'], expectedLength: 80, difficulty: '进阶', sourceLabel: '固定示例题 · 采分点已脱敏' },
];

const VERBATIM_QUESTIONS: PracticeQuestion[] = [
  { id: 'verbatim-01', type: 'verbatim', trackId: 'professional', chapterId: 'pro-01', knowledgePointId: 'point-01', prompt: '请默写“概念操作化”的完整定义要点。', answer: '概念操作化：把抽象概念转化为可观察、可记录的指标，并说明记录方式。', explanation: '默写需覆盖概念、指标、记录方式三个要点。', expectedLines: ['把抽象概念转化为可观察的指标', '说明可记录的方式'], keywords: ['操作化', '可观察', '可记录'], difficulty: '基础', sourceLabel: '固定示例题 · 原文已脱敏' },
  { id: 'verbatim-02', type: 'verbatim', trackId: 'foundation', chapterId: 'base-01', knowledgePointId: 'point-26', prompt: '请默写“框架化记忆”的检查步骤。', answer: '框架化记忆：先建立概念关系，再主动回忆，最后用题目检查提取质量。', explanation: '三个步骤缺一不可：关系、回忆、检查。', expectedLines: ['先建立概念关系', '再主动回忆', '用题目检查提取质量'], keywords: ['关系', '回忆', '检查'], difficulty: '基础', sourceLabel: '固定示例题 · 原文已脱敏' },
];

export const PRACTICE_BANK: PracticeQuestion[] = [
  ...QUIZ_FIXTURES.map((question, index) => ({
    id: question.id,
    type: 'single' as const,
    trackId: DEFAULT_SINGLE_META[index].trackId,
    chapterId: DEFAULT_SINGLE_META[index].chapterId,
    knowledgePointId: DEFAULT_SINGLE_META[index].knowledgePointId,
    prompt: question.prompt,
    options: question.options,
    correctIndex: question.correctIndex,
    answer: question.answer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    sourceLabel: question.source,
  })),
  ...EXTRA_SINGLE_QUESTIONS,
  ...MULTI_QUESTIONS,
  ...SHORT_QUESTIONS,
  ...VERBATIM_QUESTIONS,
];

export interface ReviewCard {
  id: string;
  cardType: 'knowledge' | 'vocabulary';
  trackId: PracticeTrackId;
  chapterId: string;
  title: string;
  front: string;
  back: string;
  pointTitle: string;
  queueKind: 'review' | 'new';
  failureCount: number;
  suspended: boolean;
}

type RawReviewCard = [id: string, cardType: 'knowledge' | 'vocabulary', trackId: PracticeTrackId, chapterId: string, title: string, front: string, back: string, pointTitle: string, queueKind: 'review' | 'new', failureCount: number, suspended: boolean];

const RAW_REVIEW_DECK: RawReviewCard[] = [
  ['rc-01', 'knowledge', 'professional', 'pro-02', '控制条件与结果解释', '统一测量条件能减少哪类干扰？', '统一测量条件减少测量误差，控制无关因素；它与对照设计共同支撑结论。', '控制无关因素', 'review', 1, false],
  ['rc-02', 'knowledge', 'language', 'lang-02', '材料中的限制边界', '一段材料最后说“样本较小”，这是在做什么？', '在界定证据范围，说明结论不能推广到未覆盖条件。', '证据的强度分级', 'review', 2, false],
  ['rc-03', 'knowledge', 'professional', 'pro-01', '相关与因果', '两个变量同步变化代表因果吗？', '不代表。相关只是候选，需要对照和排除其他解释。', '变量之间的关系', 'review', 3, false],
  ['rc-04', 'knowledge', 'professional', 'pro-03', '稳定性与有效性', '同一测量两次结果一致，这支持什么？', '支持稳定性；但有效性还要看是否测到目标概念。', '稳定性指标', 'new', 0, false],
  ['rc-05', 'knowledge', 'professional', 'pro-02', '样本与结论', '样本越大结论就一定越可靠吗？', '不一定。样本代表性、测量质量和设计同样重要。', '样本与结论的关系', 'new', 0, false],
  ['rc-06', 'knowledge', 'language', 'lang-01', '语境中的词义', '熟悉词在句中讲不通时先做什么？', '先查它在上下文中的搭配和语境含义。', '语境中的词义', 'review', 1, false],
  ['rc-07', 'knowledge', 'language', 'lang-02', '段落论证结构', '一段论证最少要能定位哪三部分？', '主张、支持依据和限制条件。', '段落论证结构', 'new', 0, false],
  ['rc-08', 'knowledge', 'language', 'lang-03', '表达结构模板', '短回答最稳的结构是什么？', '主张—依据—限制，先结论再证据再边界。', '表达中的结构模板', 'review', 1, false],
  ['rc-09', 'knowledge', 'foundation', 'base-01', '框架化记忆', '框架化记忆分几步？', '三步：建立概念关系、主动回忆、用题目检查提取。', '框架化记忆', 'review', 1, false],
  ['rc-10', 'knowledge', 'foundation', 'base-02', '绝对化选项', '“一定、全部、从不”这类选项要怎样处理？', '保持警惕，核对题干条件是否真的支持绝对判断。', '绝对化选项的识别', 'new', 0, false],
  ['rc-11', 'knowledge', 'foundation', 'base-03', '薄弱点证据', '只凭一次做错能判定薄弱点吗？', '不能。需要多次、同因、可比的错误证据。', '薄弱点的证据分级', 'new', 0, false],
  ['rc-12', 'knowledge', 'professional', 'pro-03', '测量误差来源', '随机误差和系统误差哪个能靠重复测量减少？', '随机误差可通过重复测量评估和减少；系统误差需要修正条件。', '测量误差的来源', 'review', 2, false],
  ['rc-13', 'vocabulary', 'language', 'lang-01', '稳定（stable）', '“stable condition” 在材料里怎么理解？', '指条件稳定、可重复，不是“舒服”或“固定不动的人”。', '语境中的词义', 'review', 1, false],
  ['rc-14', 'vocabulary', 'language', 'lang-01', '限制（limit / limitation）', 'limitation 在结论后出现通常表示什么？', '表示证据边界或研究的限制，不是“限速”。', '语境中的词义', 'review', 0, false],
  ['rc-15', 'vocabulary', 'language', 'lang-01', '主张（claim）', 'claim 在论证结构里指什么？', '指作者提出的可检验判断，不等同于事实。', '段落论证结构', 'new', 0, false],
  ['rc-16', 'vocabulary', 'language', 'lang-01', '依据（evidence）', 'evidence 的作用是什么？', '支持主张的可核验信息，强度取决于来源和设计。', '段落论证结构', 'new', 0, false],
  ['rc-17', 'vocabulary', 'language', 'lang-01', '推断（infer）', 'infer 和 guess 的区别是什么？', 'infer 是从文本信息推出判断，guess 缺少文本依据。', '语境中的词义', 'review', 2, false],
  ['rc-18', 'vocabulary', 'language', 'lang-01', '对照（control）', '研究中的 control 常指什么？', '指对照条件或控制变量，用于排除备择解释。', '控制无关因素', 'new', 0, false],
  ['rc-19', 'vocabulary', 'language', 'lang-01', '样本（sample）', 'sample 的规模能直接代表可靠性吗？', '不能。还要看代表性和抽样方式。', '样本与结论的关系', 'new', 0, false],
  ['rc-20', 'vocabulary', 'language', 'lang-01', '相关（correlation）', 'correlation 能证明因果吗？', '不能。它只是两个变量共同变化的描述。', '变量之间的关系', 'review', 1, false],
];

export const REVIEW_DECK: ReviewCard[] = RAW_REVIEW_DECK.map(([id, cardType, trackId, chapterId, title, front, back, pointTitle, queueKind, failureCount, suspended]) => ({
  id, cardType, trackId, chapterId, title, front, back, pointTitle, queueKind, failureCount, suspended,
}));

export interface WrongBookItem {
  id: string;
  title: string;
  trackId: PracticeTrackId;
  chapterId: string;
  knowledgePointId: string;
  reason: string;
  action: string;
  attempts: number;
  resolved: boolean;
  retestInDays: number;
  sourceLabel: string;
}

type RawWrongBookItem = [id: string, title: string, trackId: PracticeTrackId, chapterId: string, knowledgePointId: string, reason: string, action: string, attempts: number, resolved: boolean, retestInDays: number];

const RAW_WRONG_BOOK: RawWrongBookItem[] = [
  ['wrong-deep-01', '控制条件与结果解释', 'professional', 'pro-02', 'point-03', '概念边界混淆', '对比两个相似情境并写出差异', 1, false, 1],
  ['wrong-deep-02', '材料中的限制边界', 'language', 'lang-02', 'point-20', '遗漏限制条件', '重新标注结论的适用范围', 2, false, 2],
  ['wrong-deep-03', '阶段数据的谨慎归因', 'foundation', 'base-03', 'point-37', '把相关当成因果', '补写一条证据不足的说明', 2, false, 3],
  ['wrong-deep-04', '观点与依据的连接', 'language', 'lang-03', 'point-25', '结构断点', '完成一版三段式重写', 1, false, 3],
  ['wrong-deep-05', '相关与因果的表述', 'professional', 'pro-01', 'point-02', '表述混淆', '改写一句因果表述为相关表述', 1, false, 2],
  ['wrong-deep-06', '绝对化选项误判', 'foundation', 'base-02', 'point-32', '未核对条件', '用题干条件反证绝对化选项', 1, false, 1],
  ['wrong-deep-07', '多选题漏选', 'foundation', 'base-02', 'point-35', '组合不完整', '逐项列出与题干要求的对应', 2, false, 2],
  ['wrong-deep-08', '近义词边界混淆', 'language', 'lang-01', 'point-13', '语体不匹配', '为两个近义词各造一个适用句', 1, false, 3],
];

export const WRONG_BOOK: WrongBookItem[] = RAW_WRONG_BOOK.map(([id, title, trackId, chapterId, knowledgePointId, reason, action, attempts, resolved, retestInDays]) => ({
  id, title, trackId, chapterId, knowledgePointId, reason, action, attempts, resolved, retestInDays, sourceLabel: '固定示例 · 来源已脱敏',
}));

export interface PlanDayTemplate {
  dateOffset: -2 | -1 | 0 | 1 | 2;
  label: string;
  tasks: DemoTask[];
}

function planTask(
  id: string, title: string, subject: string, slot: TaskSlot, durationMinutes: number,
  priority: TaskPriority, status: TaskStatus, evidence: string, detail: string,
  taskType: DemoTask['taskType'], completionMode: DemoTask['completionMode'], linkRoute: string,
): DemoTask {
  return { id, title, subject, slot, durationMinutes, priority, status, evidence, detail, taskType, completionMode, linkRoute };
}

const PLAN_TEMPLATE_TASKS: Record<number, DemoTask[]> = {
  [-2]: [
    planTask('plan-d-2-01', '基础概念回顾', '专业主线', '上午', 40, 'high', 'done', '完成一张概念关系图', '重新整理定义与关系。', 'study', 'evidence', 'study-professional'),
    planTask('plan-d-2-02', '语料泛读', '语言训练', '下午', 30, 'medium', 'done', '完成两段主旨标注', '定位主张与限制。', 'study', 'evidence', 'study-language'),
    planTask('plan-d-2-03', '错题归因', '错误复盘', '晚上', 20, 'high', 'done', '完成两条原因标签', '按概念、审题、表达归类。', 'review', 'evidence', 'wrong-questions'),
    planTask('plan-d-2-04', '选择题组', '专业主线', '上午', 25, 'medium', 'done', '完成 5 题并保留解析', '检查概念迁移。', 'practice', 'evidence', 'practice'),
    planTask('plan-d-2-05', '主观表达练习', '表达训练', '晚上', 25, 'low', 'skipped', '输出一版三段结构', '训练主张—依据—限制。', 'expression', 'evidence', 'expression'),
  ],
  [-1]: [
    planTask('plan-d-1-01', '研究设计精读', '专业主线', '上午', 45, 'high', 'done', '完成一页结构与两个易混点', '对照、变量和控制条件。', 'study', 'evidence', 'study-professional'),
    planTask('plan-d-1-02', '阅读结构拆解', '语言训练', '下午', 35, 'medium', 'done', '标注论点、证据与限制各一处', '材料结构识别。', 'study', 'evidence', 'study-language'),
    planTask('plan-d-1-03', '知识卡复测', '记忆复盘', '晚上', 30, 'medium', 'done', '完成 12 张评级', '到期卡优先。', 'review', 'evidence', 'review'),
    planTask('plan-d-1-04', '简答题组', '专业主线', '上午', 30, 'high', 'done', '完成 3 题并核采分点', '结构表达训练。', 'practice', 'evidence', 'practice'),
    planTask('plan-d-1-05', '阶段测验复盘', '阶段检查', '晚上', 20, 'low', 'done', '记录分数、用时与反思', '整理阶段证据。', 'exam', 'evidence', 'exam'),
  ],
  [0]: [
    planTask('task-method-01', '核心概念精读', '专业主线', '上午', 40, 'high', 'in_progress', '完成一页结构笔记，并标出一个易混点', '从定义、关系和典型例子三个层次整理一个章节片段。', 'study', 'evidence', 'study-professional'),
    planTask('task-reading-02', '材料结构拆解', '语言训练', '下午', 45, 'medium', 'todo', '标注论点、证据与限制各一处', '用证据卡片拆解一段短材料，形成可复用的阅读框架。', 'study', 'evidence', 'study-language'),
    planTask('task-memory-03', '知识卡复测', '记忆复盘', '晚上', 30, 'medium', 'todo', '完成两轮回忆并留下信心等级', '优先处理临近到期的卡片。', 'review', 'evidence', 'review'),
    planTask('task-writing-04', '主观表达练习', '表达训练', '晚上', 35, 'low', 'todo', '输出观点、依据、例证三段结构', '用结构模板完成一个限时回答。', 'expression', 'evidence', 'expression'),
    planTask('task-review-05', '错题原因归类', '错误复盘', '下午', 25, 'high', 'done', '完成一条原因标签与修复动作', '把错误归因到概念、审题、计算或表达。', 'review', 'evidence', 'wrong-questions'),
    planTask('task-mock-06', '阶段测验证据整理', '阶段检查', '晚上', 20, 'low', 'deferred', '补齐分数、用时与反思三项证据', '将阶段检查结果整理成下周计划可以读取的证据。', 'exam', 'evidence', 'exam'),
  ],
  [1]: [
    planTask('plan-d1-01', '测量基础回顾', '专业主线', '上午', 40, 'high', 'todo', '完成稳定性与有效性对照表', '测量概念检查。', 'study', 'evidence', 'study-professional'),
    planTask('plan-d1-02', '词汇语境练习', '语言训练', '下午', 30, 'medium', 'todo', '完成 10 个语境词义判断', '结合上下文判断词义。', 'study', 'evidence', 'study-language'),
    planTask('plan-d1-03', '失败卡治理', '记忆复盘', '晚上', 20, 'high', 'todo', '暂停 2 张连续失败卡', '避免低质量卡挤占容量。', 'review', 'evidence', 'review'),
    planTask('plan-d1-04', '多选题组', '专业主线', '上午', 30, 'medium', 'todo', '完成 5 题并逐项核对', '多选精确比较。', 'practice', 'evidence', 'practice'),
    planTask('plan-d1-05', '表达重写', '表达训练', '晚上', 30, 'low', 'todo', '完成一版反馈重写', '对照上一版反馈。', 'expression', 'evidence', 'expression'),
  ],
  [2]: [
    planTask('plan-d2-01', '样本与结论复习', '专业主线', '上午', 35, 'high', 'todo', '完成两个推广范围的判断', '样本、测量与结论强度。', 'study', 'evidence', 'study-professional'),
    planTask('plan-d2-02', '段落主旨复述', '语言训练', '下午', 30, 'medium', 'todo', '完成三段的完整复述', '主旨与限制同步保留。', 'study', 'evidence', 'study-language'),
    planTask('plan-d2-03', '词汇复习', '语言训练', '晚上', 25, 'medium', 'todo', '完成到期词汇评级', '到期优先、新词受容量限制。', 'review', 'evidence', 'review'),
    planTask('plan-d2-04', '默写训练', '专业主线', '上午', 20, 'medium', 'todo', '完成 2 条要点默写', '对照原文检查遗漏。', 'practice', 'evidence', 'practice'),
    planTask('plan-d2-05', '阶段策略检查', '阶段检查', '晚上', 20, 'low', 'todo', '检查阶段证据是否满足切换条件', '为下一阶段做准备。', 'exam', 'evidence', 'exam'),
  ],
};

export const PLAN_DAY_TEMPLATES: PlanDayTemplate[] = ([-2, -1, 0, 1, 2] as const).map(offset => ({
  dateOffset: offset,
  label: offset === 0 ? '今天' : offset === -1 ? '昨天' : offset === 1 ? '明天' : offset === -2 ? '前天' : '后天',
  tasks: PLAN_TEMPLATE_TASKS[offset].map(task => ({ ...task })),
}));

export interface MicroLesson {
  id: string;
  pointId: string;
  title: string;
  steps: string[];
  check: string;
}

export const MICRO_LESSONS: MicroLesson[] = KNOWLEDGE_POINTS.map(point => ({
  id: `micro-${point.id}`,
  pointId: point.id,
  title: `${point.title} · 示例微课`,
  steps: [`第一步：复述「${point.title}」的核心定义`, `第二步：举一个不同情境下的例子`, `第三步：说明一个容易混淆的边界`],
  check: `能用自己的话解释「${point.title}」，并指出一个应用边界`,
}));

export const DIAGNOSIS_SAMPLES = [
  { trackId: 'professional' as PracticeTrackId, label: '专业主线', sessions: 48, accuracy: 82 },
  { trackId: 'language' as PracticeTrackId, label: '语言训练', sessions: 36, accuracy: 76 },
  { trackId: 'foundation' as PracticeTrackId, label: '公共基础', sessions: 29, accuracy: 79 },
] as const;

export const CASE_STUDY_POINTS = [
  { number: '01', title: '把真实导航变成一条学习闭环', text: '公开镜像保留首页、计划、学习、练习、复盘、数据与诊断、系统与目标的真实关系，让用户能看到产品如何组织学习，而不只看到几个孤立页面。' },
  { number: '02', title: '把任务证据带回后续决策', text: '计划动作、练习反馈、复测状态、错题原因和主观重写共同构成下一步依据；公开数据是虚构的，但状态关系与工作流保持一致。' },
  { number: '03', title: '把私有系统边界说清楚', text: '本项目只呈现经过泛化的产品结构与固定演示状态，不连接数据库、认证、模型或任何私有运行环境。' },
];
