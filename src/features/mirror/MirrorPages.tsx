import { useState, type Dispatch } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Archive,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileQuestion,
  FileText,
  Filter,
  History,
  Info,
  Lightbulb,
  LockKeyhole,
  PenLine,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Timer,
  X,
} from 'lucide-react';
import {
  ANALYTICS_DATA,
  CONTENT_REVIEW_ITEMS,
  DIAGNOSIS_STEPS,
  EXAM_FIXTURES,
} from '../../data/public-source-mirror';
import { useDemo } from '../../lib/demo-context';
import {
  selectActivity,
  type DemoAction,
  type DemoState,
  type Route,
} from '../../lib/demo-state';
import { MiniChart } from '../../components/MiniChart';

import { DashboardLoop } from './pages/DashboardPage';
import { PlanPage } from './pages/PlanPage';
import { PracticePage } from './pages/PracticePage';
import { ExpressionPage, ReviewPage, WrongQuestionsPage } from './pages/ReviewPages';
import { StudyPage } from './pages/StudyPages';
import {
  ActionButton,
  Kpi,
  PageHeader,
  Panel,
  Pill,
  ProgressBar,
  SectionLink,
  SectionNav,
  STATUS_META,
  Tabs,
  WorkflowContextBar,
  type Tone,
} from './primitives';

export interface MirrorPageProps { navigate: (route: Route) => void; }

function PastExamsPage({ navigate }: MirrorPageProps) {
  const [filter, setFilter] = useState('全部模块');
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="mirror-page mirror-page--wide mirror-page--past-exams"><Tabs active="past-exams" navigate={navigate} tabs={[{ route: 'practice', label: '按题型练习' }, { route: 'past-exams', label: '历年试题' }, { route: 'exam', label: '模拟考试' }]} /><PageHeader eyebrow="练习中心" title="历年试题" description="按年份、模块和来源状态查看试题；错题可以回到复盘。" navigate={navigate} action={<Pill tone="teal">来源已泛化</Pill>} /><SectionNav items={[{ id: 'past-exams-index', label: '试题索引' }, { id: 'past-exams-detail', label: '已选详情' }]} /><WorkflowContextBar title="试题索引上下文" detail="当前目录只展示泛化入口，题目与来源不会连接到外部资料。" icon={<FileQuestion size={17} />} tone="teal" /><Panel id="past-exams-index" title="试题索引" meta="固定示例目录"><div className="mirror-filter-row"><Filter size={15} /><select value={filter} onChange={event => setFilter(event.target.value)}><option>全部模块</option><option>专业主线</option><option>语言训练</option><option>公共基础</option></select><span>共 9 个示例年份入口</span></div><div className="mirror-exam-index">{['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map((year, index) => <button type="button" key={year} className={selected === `year-${year}` ? 'is-selected' : ''} onClick={() => setSelected(`year-${year}`)}><strong>{year}</strong><span>{index % 2 === 0 ? '完整示例卷' : '模块练习'}</span><small>{index + 8} 题 · 可复盘</small></button>)}</div></Panel>{selected ? <Panel id="past-exams-detail" title="已选试题" meta="演示详情"><div className="mirror-selected-exam"><div><Pill tone="blue">{selected.replace('year-', '')} · 固定示例</Pill><h2>{filter === '全部模块' ? '综合试题集' : `${filter}试题集`}</h2><p>题目、解析和来源均为脱敏示例；提交错题后可进入错题本和间隔复习。</p></div><div className="mirror-selected-exam__actions"><ActionButton onClick={() => navigate('practice')} icon={<Play size={15} />}>开始模块练习</ActionButton><ActionButton tone="secondary" onClick={() => navigate('wrong-questions')} icon={<RotateCcw size={15} />}>查看错题</ActionButton></div></div></Panel> : <div className="mirror-empty"><FileQuestion size={22} /><p>选择一个年份查看试题入口。</p></div>}</div>;
}

function ExamPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const selected = EXAM_FIXTURES.find(item => item.id === state.exam.selectedId) || EXAM_FIXTURES[0];
  if (state.exam.phase === 'draft') return <ExamRunner navigate={navigate} state={state} dispatch={dispatch} selected={selected} />;
  if (state.exam.phase === 'submitted') return <ExamResult navigate={navigate} dispatch={dispatch} selected={selected} />;
  return <div className="mirror-page mirror-page--wide mirror-page--exam"><Tabs active="exam" navigate={navigate} tabs={[{ route: 'practice', label: '按题型练习' }, { route: 'past-exams', label: '历年试题' }, { route: 'exam', label: '模拟考试' }]} /><PageHeader eyebrow="练习中心" title="模拟考试" description="草稿可恢复，交卷后保留逐题反馈和后续补救入口。" navigate={navigate} action={<Pill tone="amber">示例计时模式</Pill>} /><SectionNav items={[{ id: 'exam-notice', label: '考试状态' }, { id: 'exam-list', label: '考试列表', badge: EXAM_FIXTURES.length }]} /><WorkflowContextBar title="模拟考试上下文" detail="草稿、题号和答案进度只在内存中保留，重置演示后恢复初始状态。" icon={<Timer size={17} />} tone="amber" /><Panel id="exam-notice" className="mirror-exam-notice"><div><Timer size={22} /><div><strong>模拟考试工作流</strong><p>开始后会保存当前题号和作答进度；这里用固定状态模拟恢复和交卷。</p></div></div><Pill tone="blue">草稿 1 份</Pill></Panel><div className="mirror-exam-list" id="exam-list">{EXAM_FIXTURES.map(item => <article key={item.id} className={`mirror-exam-card is-${item.status}`}><div className="mirror-exam-card__head"><div><Pill tone={STATUS_META[item.status].tone}>{STATUS_META[item.status].label}</Pill><h2>{item.label}</h2><p>{item.subject} · {item.year}</p></div><div className="mirror-exam-card__score">{item.score === null ? <strong>{item.answered}/{item.questions}</strong> : <strong>{item.score}/{item.questions}</strong>}<span>题目进度</span></div></div><p>{item.detail}</p><div className="mirror-exam-card__meta"><span><FileText size={14} />{item.questions} 题</span><span><Clock3 size={14} />{item.minutes} 分钟</span><span><History size={14} />答案可恢复</span></div><div className="mirror-exam-card__actions"><ActionButton onClick={() => dispatch({ type: 'start_exam', id: item.id })} icon={<Play size={15} />}>{item.status === 'draft' ? '继续草稿' : item.status === 'finished' ? '查看结果' : '开始考试'}</ActionButton>{item.status === 'finished' ? <ActionButton tone="secondary" onClick={() => navigate('wrong-questions')} icon={<ArrowRight size={14} />}>查看补救</ActionButton> : null}</div></article>)}</div></div>;
}

function ExamRunner({ navigate, state, dispatch, selected }: { navigate: (route: Route) => void; state: DemoState; dispatch: Dispatch<DemoAction>; selected: typeof EXAM_FIXTURES[number] }) {
  const [answered, setAnswered] = useState(state.exam.answered);
  return <div className="mirror-page mirror-page--runner mirror-page--exam-runner"><PageHeader eyebrow="模拟考试 · 草稿已恢复" title={selected.label} description="示例答题界面；退出后会保留当前进度直到重置演示。" navigate={navigate} action={<Pill tone="amber"><Timer size={14} /> 00:38:24</Pill>} /><div className="mirror-exam-runner"><Panel className="mirror-exam-question-nav" title="题目导航" meta={`${answered}/${selected.questions} 已作答`}><div className="mirror-number-grid">{Array.from({ length: selected.questions }, (_, index) => <button type="button" key={index} className={index < answered ? 'is-answered' : index === state.exam.currentIndex ? 'is-current' : ''} onClick={() => { setAnswered(value => Math.max(value, index + 1)); dispatch({ type: 'answer_exam', index }); }}>{index + 1}</button>)}</div><ProgressBar value={(answered / selected.questions) * 100} tone="amber" label={`${Math.round((answered / selected.questions) * 100)}%`} /></Panel><Panel className="mirror-exam-question"><div className="mirror-question-meta"><Pill tone="blue">第 {state.exam.currentIndex + 1} 题</Pill><span>单选题 · 固定示例</span></div><h2>当学习计划出现延期时，哪种处理最能保留后续决策所需的证据？</h2><div className="mirror-answer-list">{['直接删除原任务', '记录原因并安排承接或拆分', '把任务时长加倍', '只修改显示状态'].map((option, index) => <button type="button" key={option} className={index === 1 && answered > state.exam.currentIndex ? 'is-selected' : ''} onClick={() => { setAnswered(value => Math.max(value, state.exam.currentIndex + 1)); dispatch({ type: 'answer_exam', index: state.exam.currentIndex }); }}><span className="mirror-answer__letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><div className="mirror-exam-actions"><ActionButton tone="secondary" onClick={() => dispatch({ type: 'advance_exam' })} icon={<ArrowRight size={15} />}>下一题</ActionButton><ActionButton onClick={() => dispatch({ type: 'submit_exam' })} icon={<Check size={15} />}>提交并交卷</ActionButton></div></Panel></div></div>;
}

function ExamResult({ navigate, dispatch, selected }: { navigate: (route: Route) => void; dispatch: Dispatch<DemoAction>; selected: typeof EXAM_FIXTURES[number] }) {
  return <div className="mirror-page mirror-page--runner mirror-page--exam-result"><PageHeader eyebrow="模拟考试结果" title="交卷完成" description="逐题反馈和补救动作会保留在结果页。" navigate={navigate} action={<Pill tone="teal">提交已确认</Pill>} /><Panel className="mirror-exam-result"><div className="mirror-result-icon is-good"><Check size={30} /></div><h2>{selected.label}</h2><div className="mirror-result-score"><strong>8</strong><span> / 12 题示例得分</span></div><p>结果已保存为固定演示状态；主观部分仍需人工确认，不自动视为权威评分。</p><div className="mirror-feedback-table">{['概念辨析 · 正确', '材料分析 · 需要复测', '结构表达 · 待重写', '综合判断 · 正确'].map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong><ArrowRight size={15} /></div>)}</div><div className="mirror-result-actions"><ActionButton onClick={() => navigate('wrong-questions')} icon={<RotateCcw size={15} />}>进入补救队列</ActionButton><ActionButton tone="secondary" onClick={() => navigate('expression')} icon={<PenLine size={15} />}>继续表达训练</ActionButton><ActionButton tone="ghost" onClick={() => dispatch({ type: 'reset_exam' })} icon={<RefreshCw size={15} />}>返回考试列表</ActionButton></div></Panel></div>;
}

function AnalyticsPage({ navigate }: MirrorPageProps) {
  const activity = selectActivity();
  return <div className="mirror-page mirror-page--wide mirror-page--analytics"><Tabs active="analytics" navigate={navigate} tabs={[{ route: 'analytics', label: '数据分析' }, { route: 'diagnosis', label: '能力诊断' }]} /><PageHeader eyebrow="数据与诊断" title="数据分析" description="把答题、复测和学习时长汇总为可解释的观察，不只展示图表。" navigate={navigate} action={<Pill tone="blue">固定示例数据</Pill>} /><SectionNav items={[{ id: 'analytics-summary', label: '指标总览' }, { id: 'analytics-trend', label: '活动趋势' }, { id: 'analytics-weak', label: '薄弱点' }, { id: 'analytics-radar', label: '能力结构' }]} /><WorkflowContextBar title="数据分析上下文" detail="当前图表来自本地固定样本，用于展示观察路径，不代表真实学习记录。" icon={<Activity size={17} />} /><section id="analytics-summary" className="mirror-kpi-grid mirror-kpi-grid--four"><Kpi icon={<Activity size={15} />} label="总答题量" value={ANALYTICS_DATA.totalAnswers} hint="示例历史" tone="blue" /><Kpi icon={<RotateCcw size={15} />} label="复习量" value={ANALYTICS_DATA.totalReviews} hint="知识卡与词汇" tone="teal" /><Kpi icon={<Target size={15} />} label="总正确率" value={`${ANALYTICS_DATA.overallAccuracy}%`} hint="样本少时仅供参考" tone="ink" /><Kpi icon={<AlertTriangle size={15} />} label="薄弱点" value={ANALYTICS_DATA.weakPoints.length} hint="待转成行动" tone="amber" /></section><div className="mirror-two-col" id="analytics-trend"><Panel title="各轨道正确率" meta="全部示例作答"><div className="mirror-accuracy-list">{ANALYTICS_DATA.subjectAccuracy.map(item => { const value = Math.round((item.correct / item.total) * 100); return <div key={item.subject}><div><strong>{item.subject}</strong><span>{item.correct}/{item.total} 题</span></div><ProgressBar value={value} tone={value >= 80 ? 'teal' : value >= 70 ? 'blue' : 'amber'} /><b>{value}%</b></div>; })}</div></Panel><Panel title="近 14 天活动" meta="学习分钟与正确率"><MiniChart data={activity.map(point => ({ label: point.label, value: point.minutes }))} tone="teal" secondary={activity.map(point => point.accuracy)} secondaryTone="blue" highlightedIndex={activity.length - 1} showLabels ariaLabel="近 14 天活动" unit=" 分钟" /></Panel></div><Panel id="analytics-weak" title="薄弱点清单" meta="按答题证据排序"><div className="mirror-weak-list">{ANALYTICS_DATA.weakPoints.map((item, index) => <article key={item.title}><span className="mirror-rank">0{index + 1}</span><div><Pill tone={item.accuracy < 60 ? 'coral' : 'amber'}>{item.subject}</Pill><strong>{item.title}</strong><p>{item.attempts} 次作答 · 正确率 {item.accuracy}% · 建议加入一次迁移练习</p></div><ArrowRight size={16} /></article>)}</div></Panel><Panel id="analytics-radar" title="能力结构" meta="理解、记忆、迁移、表达、复盘"><div className="mirror-radar"><div className="mirror-radar-graphic"><svg viewBox="0 0 240 180" role="img" aria-label="能力结构示意图"><polygon points="120,14 207,76 174,166 66,166 33,76" fill="none" stroke="currentColor" opacity=".18" /><polygon points="120,42 182,86 158,142 82,142 58,86" fill="none" stroke="currentColor" opacity=".16" /><polygon points="120,48 165,88 150,132 92,126 67,84" fill="rgba(29,78,216,.18)" stroke="var(--color-blue)" strokeWidth="2" /></svg>{['理解', '记忆', '迁移', '表达', '复盘'].map((label, index) => <span key={label} className={`radar-label radar-label-${index}`}>{label}</span>)}</div><div className="mirror-radar-legend"><div><span className="dot-blue" />当前表现</div><p>迁移和表达是当前需要更多独立证据的方向，建议在下一轮计划中各安排一项。</p><SectionLink label="去能力诊断" route="diagnosis" navigate={navigate} /></div></div></Panel></div>;
}

function DiagnosisPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const activeStep = state.diagnosisStep;
  return <div className="mirror-page mirror-page--narrow mirror-page--diagnosis"><Tabs active="diagnosis" navigate={navigate} tabs={[{ route: 'analytics', label: '数据分析' }, { route: 'diagnosis', label: '能力诊断' }]} /><PageHeader eyebrow="数据与诊断" title="能力诊断" description="先确认样本，再解释模式，最后把结论转成下一步行动。" navigate={navigate} action={<Pill tone="amber">证据不足时不下结论</Pill>} /><SectionNav items={[{ id: 'diagnosis-flow', label: '诊断流程' }, { id: 'diagnosis-sample', label: '已确认样本' }, { id: 'diagnosis-action', label: '下一步行动' }, { id: 'diagnosis-boundary', label: '诊断边界' }]} /><WorkflowContextBar title="诊断上下文" detail="先检查样本完整性，再解释模式；公开版本不会把固定样本当作个人结论。" icon={<Lightbulb size={17} />} tone="amber" /><Panel id="diagnosis-flow" title="诊断流程" meta={`第 ${activeStep + 1} / 3 步`}><div className="mirror-diagnosis-steps">{DIAGNOSIS_STEPS.map((step, index) => <div key={step.id} className={index <= activeStep ? 'is-active' : ''}><span>{index < activeStep ? <Check size={14} /> : index + 1}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div>{index < DIAGNOSIS_STEPS.length - 1 ? <i /> : null}</div>)}</div></Panel><div className="mirror-diagnosis-grid" id="diagnosis-sample"><Panel title="已确认样本" meta="可版本化的示例证据"><div className="mirror-sample-list">{['专业主线 · 48 次作答', '语言训练 · 36 次作答', '表达训练 · 6 次结构反馈'].map(item => <div key={item}><CheckCircle2 size={16} className="icon-teal" /><span>{item}</span><Pill tone="teal">已确认</Pill></div>)}</div></Panel><Panel title="当前判断" meta="诊断草稿"><div className="mirror-diagnosis-conclusion"><Lightbulb size={20} /><div><strong>{activeStep >= 1 ? '迁移与表达的证据链仍不完整' : '正在收集基线样本'}</strong><p>{activeStep >= 1 ? '熟悉题型表现稳定，但换一种问法时容易遗漏限制条件；需要一次跨情境练习和一版结构化重写。' : '完成基线检查后再解释薄弱点。'}</p></div></div></Panel></div><Panel id="diagnosis-action" title="下一步行动" meta="诊断结果必须回到计划"><div className="mirror-diagnosis-actions"><div><Target size={19} /><strong>安排一次迁移练习</strong><span>比较不同表述下的解题过程</span></div><div><PenLine size={19} /><strong>完成一版结构重写</strong><span>用主张—依据—限制组织答案</span></div><ActionButton onClick={() => { dispatch({ type: 'advance_diagnosis' }); navigate('plan'); }} icon={<ArrowRight size={15} />}>{activeStep >= 2 ? '回到计划执行' : '确认并生成建议'}</ActionButton></div></Panel><Panel id="diagnosis-boundary" title="诊断边界" meta="公开镜像声明"><div className="mirror-disclaimer"><Info size={17} /><p>这里展示的是脱敏固定数据的诊断流程，不连接真实学习记录，也不代表任何人的能力结论。</p></div></Panel></div>;
}

function SystemPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(String(state.profile.targetScore));
  const [minutes, setMinutes] = useState(String(state.profile.dailyMinutes));
  return <div className="mirror-page mirror-page--wide mirror-page--system"><Tabs active="system" navigate={navigate} tabs={[{ route: 'system', label: '系统与目标' }, { route: 'content-review', label: '内容治理' }]} /><PageHeader eyebrow="系统与目标" title="系统状态" description="真实产品会在这里汇总目标、容量、健康检查、备份和内容状态；公开版本只展示固定示例。" navigate={navigate} action={<Pill tone="ink"><LockKeyhole size={14} />只读演示环境</Pill>} /><SectionNav items={[{ id: 'system-health', label: '运行健康' }, { id: 'system-profile', label: '目标与容量' }, { id: 'system-history', label: '草稿记录' }]} /><WorkflowContextBar title="系统状态上下文" detail="这是静态公开镜像：健康、备份和目标字段只用于展示状态，不连接真实系统。" icon={<ShieldCheck size={17} />} /><div className="mirror-system-grid" id="system-health"><Panel title="运行健康" meta="示例状态"><div className="mirror-health-checks">{[['数据完整性', '正常', '全部示例记录结构完整', 'teal'], ['学习事件账本', '已连接', '动作可追踪到页面状态', 'blue'], ['备份状态', state.backupCreated ? '已创建' : '待提醒', '不写入本机文件', state.backupCreated ? 'teal' : 'amber'], ['内容来源', '需审核', '1 条示例内容待补来源', 'amber']].map(([label, value, detail, tone]) => <div key={String(label)}><span className={`system-check-icon icon-${tone}`}><CheckCircle2 size={16} /></span><div><strong>{String(label)}</strong><p>{String(detail)}</p></div><Pill tone={tone as Tone}>{String(value)}</Pill></div>)}</div></Panel><Panel title="学习数据概览" meta="固定快照"><div className="mirror-system-numbers"><Kpi label="答题记录" value="128" hint="示例" tone="blue" /><Kpi label="未解决错题" value="4" hint="示例" tone="coral" /><Kpi label="到期卡片" value="22" hint="示例" tone="amber" /><Kpi label="阶段测验" value="3" hint="含 1 份草稿" tone="teal" /></div></Panel></div><Panel id="system-profile" title="目标与每日容量" meta="动作会更新当前演示状态"><div className="mirror-profile-form"><div><label htmlFor="profile-target">目标分数</label><input id="profile-target" value={target} onChange={event => setTarget(event.target.value)} inputMode="numeric" /><small>公开版本使用泛化目标，不对应真实考试口径。</small></div><div><label htmlFor="profile-minutes">每日学习分钟</label><input id="profile-minutes" value={minutes} onChange={event => setMinutes(event.target.value)} inputMode="numeric" /><small>当前演示范围：180–300 分钟。</small></div><div className="mirror-profile-actions">{editing ? <><ActionButton onClick={() => { dispatch({ type: 'update_profile', targetScore: Number(target), dailyMinutes: Number(minutes), cardCapacity: state.profile.cardCapacity, vocabularyCapacity: state.profile.vocabularyCapacity }); setEditing(false); }} icon={<Save size={15} />}>保存设置</ActionButton><ActionButton tone="ghost" onClick={() => setEditing(false)} icon={<X size={15} />}>取消</ActionButton></> : <ActionButton tone="secondary" onClick={() => setEditing(true)} icon={<SlidersHorizontal size={15} />}>编辑目标与容量</ActionButton>}</div></div></Panel><Panel className="mirror-official-notice" title="当前产品状态" meta="公开表达已泛化"><div className="mirror-notice-content"><ShieldCheck size={21} /><div><strong>这是一个可审查的本地优先学习工作台</strong><p>真实系统的数据库、认证、模型、备份和内容治理属于私有运行边界；此页面只模拟状态展示，不提供真实连接。</p></div></div></Panel><Panel id="system-history" title="最近草稿与考试记录" meta="结构与当前产品保持一致"><div className="mirror-history-table"><div className="mirror-history-head"><span>类型</span><span>名称</span><span>状态</span><span>进度</span><span>更新时间</span></div>{EXAM_FIXTURES.map(item => <div className="mirror-history-row" key={item.id}><span>考试草稿</span><strong>{item.label}</strong><Pill tone={STATUS_META[item.status].tone}>{STATUS_META[item.status].label}</Pill><span>{item.answered}/{item.questions} 题</span><span>今天 09:20</span></div>)}</div></Panel><div className="mirror-system-footer-actions"><ActionButton tone="secondary" onClick={() => dispatch({ type: 'create_backup' })} icon={<Archive size={15} />}>模拟创建备份</ActionButton><ActionButton tone="ghost" onClick={() => navigate('content-review')} icon={<FileCheck2 size={15} />}>打开内容治理</ActionButton></div></div>;
}

function ContentReviewPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState('全部');
  const visible = CONTENT_REVIEW_ITEMS.filter(item => filter === '全部' || (filter === '待处理' ? state.contentStatuses[item.id] !== 'approved' : item.type === filter));
  return <div className="mirror-page mirror-page--wide mirror-page--content-review"><Tabs active="content-review" navigate={navigate} tabs={[{ route: 'system', label: '系统与目标' }, { route: 'content-review', label: '内容治理' }]} /><PageHeader eyebrow="系统与目标" title="内容治理" description="审核状态和冻结状态分开管理，风险与来源都保留在记录里。" navigate={navigate} action={<Pill tone="amber">1 条高风险示例</Pill>} /><SectionNav items={[{ id: 'content-filter', label: '审核筛选' }, { id: 'content-list', label: '内容记录', badge: visible.length }]} /><WorkflowContextBar title="内容治理上下文" detail="审核、冻结和来源状态彼此独立；这里仅展示固定内容样本，不连接外部内容库。" icon={<FileCheck2 size={17} />} tone="amber" /><Panel id="content-filter" title="审核筛选" meta={`${visible.length} 条内容`}><div className="mirror-filter-row"><Filter size={15} /><div className="mirror-segmented">{['全部', '待处理', '章节摘要', '练习解析', '微课卡片'].map(item => <button type="button" key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><span>冻结不等于审核通过</span></div></Panel><div className="mirror-content-list" id="content-list">{visible.map(item => { const status = state.contentStatuses[item.id] || item.status; const meta = STATUS_META[status] || STATUS_META.draft; return <article key={item.id} className="mirror-content-item"><div className="mirror-content-item__icon"><FileText size={19} /></div><div className="mirror-content-item__body"><div><Pill tone={meta.tone}>{meta.label}</Pill><strong>{item.title}</strong><span>{item.type}</span></div><p>{item.source} · 最近更新 {item.updated}</p><div className="mirror-content-meta"><span>风险等级：{item.risk}</span><span>版本可追溯</span><span>冻结状态独立记录</span></div></div><div className="mirror-content-actions">{status !== 'approved' ? <ActionButton tone="primary" onClick={() => dispatch({ type: 'approve_content', id: item.id })} icon={<Check size={14} />}>标为已通过</ActionButton> : <Pill tone="teal">审核完成</Pill>}<ActionButton tone="ghost" icon={<History size={14} />}>查看记录</ActionButton></div></article>; })}</div></div>;
}

export function MirrorCaseStudyLink({ navigate }: MirrorPageProps) { return <SectionLink label="查看公开案例说明" route="case-study" navigate={navigate} />; }

export const MIRROR_PAGE_COMPONENTS = {
  DashboardLoop,
  PlanPage,
  StudyPage,
  PracticePage,
  PastExamsPage,
  ReviewPage,
  WrongQuestionsPage,
  ExpressionPage,
  ExamPage,
  AnalyticsPage,
  DiagnosisPage,
  SystemPage,
  ContentReviewPage,
};
