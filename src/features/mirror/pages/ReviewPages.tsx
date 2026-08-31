import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  Flag,
  MessageSquareText,
  PenLine,
  RotateCcw,
  Save,
  Search,
  Sparkles,
} from 'lucide-react';
import { EXPRESSION_FIXTURES } from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectActiveReviewDeck,
  selectReviewDeckSummary,
  selectWrongBookItems,
  type Route,
} from '../../../lib/demo-state';
import {
  ActionButton,
  Kpi,
  PageHeader,
  Panel,
  Pill,
  ProgressBar,
  SectionNav,
  Tabs,
  WorkflowContextBar,
} from '../primitives';
import type { MirrorPageProps } from '../MirrorPages';

type ReviewFilter = 'all' | 'professional' | 'language' | 'foundation' | 'vocabulary';

const REVIEW_FILTERS: Array<{ value: ReviewFilter; label: string }> = [
  { value: 'all', label: '全部队列' },
  { value: 'professional', label: '专业主线' },
  { value: 'language', label: '语言训练' },
  { value: 'foundation', label: '公共基础' },
  { value: 'vocabulary', label: '词汇' },
];

function trackLabel(trackId: string): string {
  return trackId === 'professional' ? '专业主线' : trackId === 'language' ? '语言训练' : '公共基础';
}

function ReviewDeckRow({ card, dispatch }: { card: ReturnType<typeof selectActiveReviewDeck>[number]; dispatch: ReturnType<typeof useDemo>['dispatch'] }) {
  return <article className={`mirror-review-item is-${card.status}`} data-testid={`review-item-${card.id}`}>
    <div className="mirror-review-item__main">
      <div className="mirror-review-item__title">
        <Pill tone={card.status === 'cleared' ? 'teal' : card.status === 'due' ? 'amber' : 'blue'}>{card.status === 'cleared' ? '已关闭' : card.status === 'due' ? '待复测' : '观察中'}</Pill>
        {card.cardType === 'vocabulary' ? <Pill tone="teal">词汇</Pill> : null}
        <strong>{card.title}</strong>
        <span>{trackLabel(card.trackId)} · {card.chapterId}</span>
      </div>
      <p className="mirror-card-front">{card.front}</p>
      <p className="mirror-card-back"><small>参考要点</small>{card.back}</p>
      <div className="mirror-review-milestones">
        <span className={card.stage >= 1 ? 'is-done' : ''}>{card.stage >= 1 ? <Check size={12} /> : '1'} 首次证据</span>
        <span className={card.stage >= 2 ? 'is-done' : ''}>{card.stage >= 2 ? <Check size={12} /> : '2'} 再次证据</span>
        <small>{card.lastResultLabel} · 已复测 {card.attempts} 次</small>
      </div>
    </div>
    <div className="mirror-review-item__side">
      <div className="mirror-confidence"><span>信心</span><div>{[1, 2, 3, 4, 5].map(level => <button type="button" key={level} className={card.confidence === level ? 'is-selected' : ''} aria-label={`信心等级 ${level}`} onClick={() => dispatch({ type: 'set_review_confidence', id: card.id, confidence: level })}>{level}</button>)}</div></div>
      {card.status !== 'cleared' ? <div className="mirror-review-item__actions"><ActionButton tone="primary" onClick={() => dispatch({ type: 'rate_review_card', id: card.id, quality: 5 })} testId={`review-pass-${card.id}`}>复测通过</ActionButton><ActionButton tone="secondary" onClick={() => dispatch({ type: 'rate_review_card', id: card.id, quality: 1 })} testId={`review-fail-${card.id}`}>需要重练</ActionButton></div> : <span className="mirror-cleared-note">两次独立复测已完成</span>}
    </div>
  </article>;
}

function FlashcardSession({ navigate, mode, setMode }: {
  navigate: (route: Route) => void; mode: 'quick' | 'deep'; setMode: (mode: 'idle' | 'quick' | 'deep') => void;
}) {
  const { state, dispatch } = useDemo();
  const active = selectActiveReviewDeck(state);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const current = active[index];
  if (!current) return null;
  const isQuick = mode === 'quick';
  const qualities = isQuick ? [1, 3, 5] : [0, 1, 2, 3, 4, 5];
  const labels: Record<number, string> = { 0: '完全不会', 1: '很模糊', 2: '需要提示', 3: '基本掌握', 4: '清晰', 5: '非常熟' };

  function rate(quality: number) {
    dispatch({ type: 'rate_review_card', id: current.id, quality });
    setFlipped(false);
    if (index < active.length - 1) setIndex(index + 1);
    else setMode('idle');
  }

  return <div className="mirror-page mirror-page--runner mirror-page--review-session">
    <PageHeader eyebrow="复盘中心" title={isQuick ? '快速模式' : '深度模式'} description="先回忆，再翻卡确认；评级会影响下一次出现时间。" navigate={navigate} action={<Pill tone="amber">剩余 {active.length - index} 张</Pill>} />
    <div className="mirror-review-session">
      <div className="mirror-review-session__progress"><span>第 {index + 1} / {active.length} 张</span><ProgressBar value={((index + 1) / Math.max(1, active.length)) * 100} tone="amber" label="队列进度" /></div>
      <article className={`mirror-flashcard${flipped ? ' is-flipped' : ''}`}>
        <div className="mirror-flashcard__face"><Pill tone="blue">{trackLabel(current.trackId)} · {current.cardType === 'vocabulary' ? '词汇' : '知识卡'}</Pill><h2>{current.front}</h2><p>{current.pointTitle}</p><button type="button" className="mirror-flip-button" onClick={() => setFlipped(true)}><RotateCcw size={18} />{flipped ? '已翻面' : '回忆后翻卡'}</button></div>
        {flipped ? <div className="mirror-flashcard__answer"><span>参考要点</span><strong>{current.back}</strong><p>评级后系统会按确定性间隔安排下一次复习。</p></div> : null}
      </article>
      {flipped ? <div className="mirror-rating"><p>这次回忆质量如何？</p><div>{qualities.map(value => <button type="button" key={value} onClick={() => rate(value)}>{value}<small>{labels[value]}</small></button>)}</div></div> : null}
      <ActionButton tone="ghost" onClick={() => setMode('idle')} icon={<ArrowLeft size={15} />}>返回队列</ActionButton>
    </div>
  </div>;
}

export function ReviewPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const summary = selectReviewDeckSummary(state);
  const active = selectActiveReviewDeck(state);
  const [mode, setMode] = useState<'idle' | 'quick' | 'deep'>('idle');
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [showLeeches, setShowLeeches] = useState(false);
  const filtered = active.filter(card => filter === 'all' || (filter === 'vocabulary' ? card.cardType === 'vocabulary' : card.trackId === filter));
  const leeches = state.reviewDeck.filter(card => card.failureCount >= 3 || card.suspended);
  const cleared = state.reviewDeck.filter(card => card.status === 'cleared');

  if (mode !== 'idle') return <FlashcardSession navigate={navigate} mode={mode} setMode={setMode} />;

  return <div className="mirror-page mirror-page--wide mirror-page--review">
    <Tabs active="review" navigate={navigate} tabs={[{ route: 'review', label: '间隔复习' }, { route: 'wrong-questions', label: '错题本' }, { route: 'expression', label: '主观表达' }]} />
    <PageHeader eyebrow="复盘中心" title="间隔复习" description="知识卡按间隔调度；第一次通过进入观察，第二次独立通过才关闭。" navigate={navigate} action={<Pill tone="amber">本地确定性间隔</Pill>} />
    <SectionNav items={[{ id: 'review-route', label: '恢复路线' }, { id: 'review-queue', label: '队列概览', badge: active.length }, { id: 'review-modes', label: '复习模式' }, { id: 'review-governance', label: '失败治理' }]} />
    <WorkflowContextBar title="复盘上下文" detail="评级 0-5 决定下次间隔；失败卡可暂停，避免挤占今日容量。" icon={<RotateCcw size={17} />} tone="amber" />
    <Panel id="review-route" className="mirror-memory-route" title="今日记忆恢复路线" meta="先处理到期内容">
      <div className="mirror-route-cards"><div className="is-primary"><span>知识卡</span><strong>{summary.due - summary.vocabularyDue} 张到期</strong><p>本轮可载入 {active.filter(card => card.cardType === 'knowledge').length} 张 · 按章节块轮转</p></div><div><span>语言词汇</span><strong>{summary.vocabularyDue} 个到期库存</strong><p>新内容受今日容量限制</p></div><div><span>反复失败卡</span><strong>{leeches.length} 张待治理</strong><p>可暂停，避免挤占今日容量</p></div></div>
    </Panel>
    <Panel id="review-queue" title="队列概览" meta="按轨道与题型组织">
      <div className="mirror-review-summary"><Kpi label="待复测" value={summary.due} hint="今天到期" tone="amber" /><Kpi label="观察中" value={summary.watch} hint="下一轮确认" tone="blue" /><Kpi label="已关闭" value={summary.cleared} hint="保留证据" tone="teal" /><Kpi label="今日容量" value={`${state.profile.cardCapacity} 张`} hint="示例上限" tone="ink" /></div>
      <div className="mirror-subject-queues">
        <div><span>专业主线</span><strong>{active.filter(card => card.trackId === 'professional').length} 张</strong><small>含到期与新卡</small></div>
        <div><span>语言训练</span><strong>{active.filter(card => card.trackId === 'language').length} 张</strong><small>知识卡与词汇</small></div>
        <div><span>公共基础</span><strong>{active.filter(card => card.trackId === 'foundation').length} 张</strong><small>按章节连续处理</small></div>
      </div>
    </Panel>
    <div className="mirror-mode-grid" id="review-modes">
      <button type="button" onClick={() => setMode('quick')}><Sparkles size={21} /><div><strong>快速模式</strong><p>翻卡后只给三档评级，适合碎片时间。</p></div><ArrowRight size={16} /></button>
      <button type="button" onClick={() => setMode('deep')}><Brain size={21} /><div><strong>深度模式</strong><p>先回忆再翻卡，0-5 严格自评。</p></div><ArrowRight size={16} /></button>
    </div>
    <Panel title="当前队列" meta={`${filtered.length} 条需要行动`}>
      <div className="mirror-review-filter">{REVIEW_FILTERS.map(item => <button type="button" key={item.value} className={filter === item.value ? 'is-active' : ''} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
      <div className="mirror-review-list">{filtered.map(card => <ReviewDeckRow key={card.id} card={card} dispatch={dispatch} />)}</div>
      {filtered.length === 0 ? <div className="mirror-empty"><Check size={21} /><p>当前筛选没有待复习卡片。</p></div> : null}
    </Panel>
    <Panel id="review-governance" title="反复失败卡治理" meta="避免低质量卡持续挤占容量">
      <button type="button" className="mirror-collapse-trigger" onClick={() => setShowLeeches(value => !value)}><div><AlertTriangle size={17} /><strong>{leeches.length} 张卡达到治理阈值</strong><span>可暂停或恢复队列</span></div><ChevronDown size={16} className={showLeeches ? 'rotate-180' : ''} /></button>
      {showLeeches ? <div className="mirror-leech-list">{leeches.map(card => <div key={card.id}><Pill tone={card.suspended ? 'muted' : 'amber'}>{card.suspended ? '已暂停' : '待治理'}</Pill><span>{card.title}</span><small>连续失败 {card.failureCount} 次 · 建议暂停并补前置</small>{card.suspended ? <ActionButton tone="ghost" onClick={() => dispatch({ type: 'resume_leech', id: card.id })}>恢复队列</ActionButton> : <ActionButton tone="ghost" onClick={() => dispatch({ type: 'suspend_leech', id: card.id })}>暂停卡片</ActionButton>}</div>)}</div> : null}
    </Panel>
    {cleared.length ? <Panel title="已关闭" meta="保留两次独立证据"><div className="mirror-review-list">{cleared.map(card => <ReviewDeckRow key={card.id} card={card} dispatch={dispatch} />)}</div></Panel> : null}
  </div>;
}

export function WrongQuestionsPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const items = selectWrongBookItems(state);
  const [filter, setFilter] = useState('全部');
  const [query, setQuery] = useState('');
  const visible = items.filter(item => (filter === '全部' || (filter === '待复测' ? !item.resolved : filter === '已处理' ? item.resolved : trackLabel(item.trackId) === filter)) && item.title.includes(query));

  return <div className="mirror-page mirror-page--wide mirror-page--wrong">
    <Tabs active="wrong-questions" navigate={navigate} tabs={[{ route: 'review', label: '间隔复习' }, { route: 'wrong-questions', label: '错题本' }, { route: 'expression', label: '主观表达' }]} />
    <PageHeader eyebrow="复盘中心" title="错题本" description="错误不是收藏夹；每条记录都要有原因、修复动作和延迟复测。" navigate={navigate} action={<Pill tone="coral">{items.filter(item => !item.resolved).length} 条待复测</Pill>} />
    <SectionNav items={[{ id: 'wrong-filter', label: '筛选与搜索' }, { id: 'wrong-list', label: '错题记录', badge: visible.length }]} />
    <WorkflowContextBar title="错题证据上下文" detail="每条记录保留原因、修复动作和复测次数；处理结果只改变公开演示状态。" icon={<AlertTriangle size={17} />} tone="coral" />
    <Panel id="wrong-filter" title="错题筛选" meta={`${visible.length} 条结果`}>
      <div className="mirror-filter-row"><div className="mirror-search"><Search size={15} /><input aria-label="搜索错题" placeholder="搜索标题" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="mirror-segmented">{['全部', '待复测', '已处理', '专业主线', '语言训练', '公共基础'].map(item => <button type="button" key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
    </Panel>
    <div className="mirror-wrong-list" id="wrong-list">
      {visible.map(item => <article key={item.id} className={`mirror-wrong-item${item.resolved ? ' is-resolved' : ''}`}>
        <div className="mirror-wrong-item__marker">{item.resolved ? <Check size={17} /> : <AlertTriangle size={17} />}</div>
        <div className="mirror-wrong-item__body"><div><Pill tone={item.resolved ? 'teal' : item.retestInDays <= 1 ? 'coral' : 'amber'}>{item.resolved ? '已处理' : `${item.retestInDays} 天后复测`}</Pill><strong>{item.title}</strong></div><p>{trackLabel(item.trackId)} · {item.chapterId} · {item.sourceLabel}</p><div className="mirror-wrong-evidence"><span><Flag size={13} />原因：{item.reason}</span><span><RotateCcw size={13} />已复测 {item.attempts} 次</span><span><FileCheck2 size={13} />修复：{item.action}</span></div></div>
        <div className="mirror-wrong-actions">{!item.resolved ? <ActionButton tone="primary" onClick={() => dispatch({ type: 'resolve_wrong', id: item.id })} icon={<Check size={14} />}>记录已复测</ActionButton> : <Pill tone="teal">证据已保留</Pill>}<ActionButton tone="ghost" onClick={() => dispatch({ type: 'schedule_wrong_retest', id: item.id })} icon={<CalendarClock size={14} />}>安排 3 天后复测</ActionButton><ActionButton tone="ghost" onClick={() => { dispatch({ type: 'configure_practice', trackId: item.trackId, chapterId: item.chapterId, questionType: 'single', count: 3, focusKnowledgePointId: item.knowledgePointId }); navigate('practice'); }} icon={<ArrowRight size={14} />}>去补救练习</ActionButton></div>
      </article>)}
    </div>
    {visible.length === 0 ? <div className="mirror-empty"><Search size={21} /><p>没有匹配的错题。</p></div> : null}
  </div>;
}


export function ExpressionPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const [selectedId, setSelectedId] = useState(state.expression.selectedId);
  const source = EXPRESSION_FIXTURES.find(item => item.id === selectedId) || EXPRESSION_FIXTURES[0];
  const draft = state.expression.drafts[source.id] || source.draft;
  const accepted = state.expression.accepted.includes(source.id);
  const practiceShort = state.practice.history.filter(session => session.questionType === 'short').slice(-1)[0];

  return <div className="mirror-page mirror-page--wide mirror-page--expression">
    <Tabs active="expression" navigate={navigate} tabs={[{ route: 'review', label: '间隔复习' }, { route: 'wrong-questions', label: '错题本' }, { route: 'expression', label: '主观表达' }]} />
    <PageHeader eyebrow="复盘中心" title="主观表达" description="原稿、采分点、重写和结项都留在同一条记录里。" navigate={navigate} action={<Pill tone="coral">需要人工确认的示例反馈</Pill>} />
    <SectionNav items={[{ id: 'expression-list', label: '待改进作答' }, { id: 'expression-task', label: '题目与采分点' }, { id: 'expression-feedback', label: '上一版反馈' }, { id: 'expression-rewrite', label: '下一版作答' }]} />
    <WorkflowContextBar title="主观表达上下文" detail="反馈只提供结构提示，最终判断仍由学习者在下一版作答中确认。" icon={<PenLine size={17} />} tone="coral" />
    {practiceShort ? <Panel title="来自练习简答的回看" meta="本地规则评分"><div className="mirror-answer-quote"><span>题目</span><p>{practiceShort.items[0]?.prompt}</p><span>本轮得分</span><strong>{practiceShort.score}/{practiceShort.maxScore}</strong></div><ActionButton tone="ghost" onClick={() => navigate('practice')} icon={<ArrowRight size={14} />}>再练一组简答</ActionButton></Panel> : null}
    <div className="mirror-expression-layout">
      <Panel id="expression-list" title="待改进作答" meta="选择一条进入详情">
        <div className="mirror-expression-list">{EXPRESSION_FIXTURES.map(item => <button type="button" key={item.id} className={source.id === item.id ? 'is-selected' : ''} onClick={() => { setSelectedId(item.id); dispatch({ type: 'select_expression', id: item.id }); }}><div><Pill tone={state.expression.accepted.includes(item.id) ? 'teal' : 'coral'}>{state.expression.accepted.includes(item.id) ? '已结项' : '待重写'}</Pill><strong>{item.taskType}</strong></div><p>{item.title}</p><small>重写 {state.expression.revisions[item.id] || item.revisions} 次 · {item.subject}</small><ChevronRight size={16} /></button>)}</div>
        <div className="mirror-expression-queue"><span>当前队列</span><strong>{EXPRESSION_FIXTURES.filter(item => !state.expression.accepted.includes(item.id)).length} 条</strong><small>完成重写后回到计划</small></div>
      </Panel>
      <div className="mirror-expression-detail">
        <Panel id="expression-task" title="题目 / 任务" meta={source.source}><h2>{source.title}</h2><p>{source.prompt}</p><div className="mirror-reference"><div className="mirror-reference__head"><h3>可信采分点</h3><Pill tone="blue">固定示例</Pill></div><ol>{source.reference.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div></Panel>
        <Panel id="expression-feedback" title="上一版作答与反馈" meta="反馈仅作学习对照"><div className="mirror-answer-quote"><span>原稿</span><p>{source.draft}</p></div><div className="mirror-feedback-box"><MessageSquareText size={17} /><div><strong>{source.feedback}</strong><p>反馈说明结构问题和下一步动作，不自动替代人工判断。</p></div></div></Panel>
        <Panel id="expression-rewrite" title="亲自写出下一版" meta={`已重写 ${state.expression.revisions[source.id] || source.revisions} 次`}><textarea aria-label="主观表达重写" value={draft} onChange={event => dispatch({ type: 'edit_expression_draft', id: source.id, draft: event.target.value })} /><div className="mirror-expression-actions"><ActionButton onClick={() => dispatch({ type: 'save_expression_revision', id: source.id, draft })} icon={<Save size={15} />}>保存并生成示例反馈</ActionButton>{!accepted ? <ActionButton tone="secondary" onClick={() => dispatch({ type: 'accept_expression', id: source.id })} icon={<Check size={15} />}>接受当前版本并结项</ActionButton> : <Pill tone="teal">当前版本已结项</Pill>}<ActionButton tone="ghost" onClick={() => navigate('plan')} icon={<ArrowRight size={15} />}>回到计划</ActionButton></div></Panel>
      </div>
    </div>
  </div>;
}
