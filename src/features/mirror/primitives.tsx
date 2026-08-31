import type { Dispatch, ReactNode } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDot,
  Clock3,
  FileCheck2,
  Info,
  Play,
  Sparkles,
} from 'lucide-react';
import {
  type DemoAction,
  type KnowledgeStatus,
  type Route,
  selectActiveReviewItems,
  selectStatusLabel,
} from '../../lib/demo-state';
import type { DemoTask, KnowledgePoint } from '../../data/public-source-mirror';

export type Tone = 'blue' | 'teal' | 'amber' | 'coral' | 'ink' | 'muted';

export const STATUS_META: Record<string, { label: string; tone: Tone }> = {
  todo: { label: '待开始', tone: 'muted' },
  in_progress: { label: '进行中', tone: 'blue' },
  done: { label: '已完成', tone: 'teal' },
  deferred: { label: '已延后', tone: 'amber' },
  skipped: { label: '已跳过', tone: 'muted' },
  due: { label: '待复测', tone: 'amber' },
  watch: { label: '观察中', tone: 'blue' },
  cleared: { label: '已关闭', tone: 'teal' },
  unseen: { label: '未学习', tone: 'muted' },
  learning: { label: '学习中', tone: 'blue' },
  review: { label: '需复习', tone: 'amber' },
  mastered: { label: '已掌握', tone: 'teal' },
  draft: { label: '草稿', tone: 'amber' },
  ready: { label: '可开始', tone: 'blue' },
  finished: { label: '已完成', tone: 'teal' },
  reviewing: { label: '审核中', tone: 'amber' },
  approved: { label: '已通过', tone: 'teal' },
  frozen: { label: '已冻结', tone: 'ink' },
  needs_revision: { label: '待重写', tone: 'coral' },
  accepted: { label: '已结项', tone: 'teal' },
};

export function Pill({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function ActionButton({ children, tone = 'primary', onClick, disabled = false, icon, testId }: {
  children: ReactNode; tone?: 'primary' | 'secondary' | 'ghost' | 'warning'; onClick?: () => void; disabled?: boolean; icon?: ReactNode; testId?: string;
}) {
  return <button type="button" className={`btn btn--${tone}`} onClick={onClick} disabled={disabled} data-testid={testId}>{icon}{children}</button>;
}

export function Panel({ children, title, meta, className = '', id }: { children: ReactNode; title?: ReactNode; meta?: ReactNode; className?: string; id?: string }) {
  return <section className={`mirror-panel ${className}`} id={id}>
    {title ? <div className="mirror-panel__head"><h2>{title}</h2>{meta ? <span>{meta}</span> : null}</div> : null}
    {children}
  </section>;
}

export function PageHeader({ eyebrow, title, description, navigate: _navigate, action }: {
  eyebrow?: string; title: string; description: string; navigate: (route: Route) => void; action?: ReactNode;
}) {
  return <header className="mirror-page-header">
    <div>
      {eyebrow ? <p className="mirror-eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action ? <div className="mirror-page-header__actions">{action}</div> : null}
  </header>;
}

export function Tabs({ tabs, active, navigate }: { tabs: Array<{ route: Route; label: string }>; active: Route; navigate: (route: Route) => void }) {
  return <nav className="mirror-tabs" aria-label="页面子导航">
    {tabs.map(tab => <button key={tab.route} type="button" className={active === tab.route ? 'is-active' : ''} aria-current={active === tab.route ? 'page' : undefined} onClick={() => navigate(tab.route)}>{tab.label}</button>)}
  </nav>;
}

export function SectionNav({ items, label = '本页导航' }: { items: Array<{ id: string; label: string; badge?: ReactNode }>; label?: string }) {
  return <nav className="mirror-section-nav" aria-label={label}>
    {items.map(item => <button key={item.id} type="button" onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
      <span>{item.label}</span>{item.badge !== undefined ? <b>{item.badge}</b> : null}
    </button>)}
  </nav>;
}

export function WorkflowContextBar({ title, detail, icon = <Info size={17} />, tone = 'blue' }: { title: string; detail: string; icon?: ReactNode; tone?: Tone }) {
  return <aside className={`mirror-workflow-context mirror-workflow-context--${tone}`}>
    <span className="mirror-workflow-context__icon">{icon}</span>
    <div><strong>{title}</strong><p>{detail}</p></div>
  </aside>;
}

export function ProgressBar({ value, tone = 'blue', label }: { value: number; tone?: Tone; label?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div className="mirror-progress-wrap">
    <div className="mirror-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe} aria-label={label || '进度'}><span className={`tone-${tone}`} style={{ width: `${safe}%` }} /></div>
    {label ? <span className="mirror-progress__label">{label}</span> : null}
  </div>;
}

export function Kpi({ label, value, hint, tone = 'ink', icon }: { label: string; value: ReactNode; hint?: string; tone?: Tone; icon?: ReactNode }) {
  return <div className={`mirror-kpi mirror-kpi--${tone}`}>
    <div className="mirror-kpi__label">{icon}{label}</div>
    <strong>{value}</strong>
    {hint ? <span>{hint}</span> : null}
  </div>;
}

export function SectionLink({ label, route, navigate }: { label: string; route: Route; navigate: (route: Route) => void }) {
  return <button type="button" className="mirror-section-link" onClick={() => navigate(route)}>{label}<ArrowRight size={15} aria-hidden="true" /></button>;
}

export function StageStrip({ active = 2 }: { active?: number }) {
  const stages = ['计划', '学习 / 练习', '证据记录', '延迟复盘', '洞察决策'];
  return <div className="mirror-stage-strip" aria-label="学习闭环阶段">
    {stages.map((stage, index) => <div key={stage} className={index <= active ? 'is-active' : ''}><span>{index + 1}</span><b>{stage}</b>{index < stages.length - 1 ? <i aria-hidden="true" /> : null}</div>)}
  </div>;
}

export function TaskRow({ task, dispatch, navigate, compact = false }: { task: DemoTask; dispatch: Dispatch<DemoAction>; navigate: (route: Route) => void; compact?: boolean }) {
  const status = STATUS_META[task.status];
  return <li className={`mirror-task-row${task.status === 'done' ? ' is-done' : ''}`} data-testid="mirror-task-row">
    <button type="button" className={`mirror-task-check${task.status === 'done' ? ' is-done' : ''}`} aria-label={task.status === 'done' ? `${task.title}（已完成）` : `完成任务：${task.title}`} onClick={() => dispatch({ type: 'complete_task', id: task.id })}>
      {task.status === 'done' ? <Check size={16} aria-hidden="true" /> : <CircleDot size={16} aria-hidden="true" />}
    </button>
    <div className="mirror-task-row__body">
      <div className="mirror-task-row__title"><b>{task.title}</b><Pill tone={status.tone}>{status.label}</Pill><Pill tone="muted">{task.subject}</Pill></div>
      <p>{compact ? task.evidence : task.detail}</p>
      <div className="mirror-task-row__meta"><span><Clock3 size={13} />{task.durationMinutes} 分钟</span><span>证据：{task.evidence}</span>{task.deferReason ? <span className="text-amber">延后：{task.deferReason}</span> : null}</div>
    </div>
    {task.status === 'todo' ? <ActionButton tone="secondary" onClick={() => { dispatch({ type: 'start_task', id: task.id }); navigate(task.linkRoute as Route); }} icon={<Play size={15} />}>开始</ActionButton> : null}
  </li>;
}

export function ConfigSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="mirror-config-field"><label>{label}</label><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></div>;
}

export function KnowledgePointRow({ point, status, dispatch }: { point: KnowledgePoint; status: KnowledgeStatus; dispatch: Dispatch<DemoAction> }) {
  const meta = STATUS_META[status];
  const next: KnowledgeStatus = status === 'unseen' ? 'learning' : status === 'learning' ? 'review' : status === 'review' ? 'mastered' : 'mastered';
  return <article className="mirror-point-row"><div className="mirror-point-row__icon"><BrainCircuit size={17} /></div><div className="mirror-point-row__body"><div><strong>{point.title}</strong><Pill tone={meta.tone}>{meta.label}</Pill></div><p>{point.detail}</p><span><FileCheck2 size={13} />{point.evidence} · {point.sourceLabel}</span></div><ActionButton tone={status === 'mastered' ? 'ghost' : 'secondary'} onClick={() => dispatch({ type: 'set_study_status', id: point.id, status: next })} icon={status === 'mastered' ? <Check size={14} /> : <ArrowRight size={14} />}>{status === 'mastered' ? '已掌握' : `标为${STATUS_META[next].label}`}</ActionButton></article>;
}

export function ZapIcon() { return <Sparkles size={21} />; }

export function ReviewItemRow({ item, dispatch }: { item: ReturnType<typeof selectActiveReviewItems>[number]; dispatch: Dispatch<DemoAction> }) {
  const status = STATUS_META[item.status];
  return <article className={`mirror-review-item is-${item.status}`} data-testid={`review-item-${item.id}`}><div className="mirror-review-item__main"><div className="mirror-review-item__title"><Pill tone={status.tone}>{selectStatusLabel(item.status)}</Pill><strong>{item.title}</strong><span>{item.subject} · {item.chapter}</span></div><p>{item.reason}</p><div className="mirror-review-milestones"><span className={item.stage >= 1 ? 'is-done' : ''}>{item.stage >= 1 ? <Check size={12} /> : '1'} 首次证据</span><span className={item.stage >= 2 ? 'is-done' : ''}>{item.stage >= 2 ? <Check size={12} /> : '2'} 再次证据</span><small>{item.intervalLabel} · 已复测 {item.attempts} 次</small></div></div><div className="mirror-review-item__side"><div className="mirror-confidence"><span>信心</span><div>{[1, 2, 3, 4, 5].map(level => <button type="button" key={level} className={item.confidence === level ? 'is-selected' : ''} aria-label={`信心等级 ${level}`} onClick={() => dispatch({ type: 'set_review_confidence', id: item.id, confidence: level })}>{level}</button>)}</div></div>{item.status !== 'cleared' ? <div className="mirror-review-item__actions"><ActionButton tone="primary" onClick={() => dispatch({ type: 'retest_review', id: item.id, correct: true })} testId={`review-pass-${item.id}`}>复测通过</ActionButton><ActionButton tone="secondary" onClick={() => dispatch({ type: 'retest_review', id: item.id, correct: false })} testId={`review-fail-${item.id}`}>需要重练</ActionButton></div> : <span className="mirror-cleared-note">两次独立复测已完成</span>}</div></article>;
}
