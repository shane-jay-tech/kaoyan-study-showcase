import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  Play,
  Scissors,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  DEFER_REASON_OPTIONS,
  MIRROR_PROFILE,
  type DemoTask,
} from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectPlanDateLabel,
  selectPlanGroups,
  selectPlanSummary,
  selectPlanWeeklyReview,
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
  STATUS_META,
  Tabs,
  WorkflowContextBar,
} from '../primitives';
import type { MirrorPageProps } from '../MirrorPages';

type TaskAction = { taskId: string; kind: 'defer' | 'skip' } | null;

function PlanTaskRow({ task, navigate, onAction, dispatch, panel }: {
  task: DemoTask; navigate: (route: Route) => void;
  onAction: (action: TaskAction) => void;
  dispatch: ReturnType<typeof useDemo>['dispatch'];
  panel?: ReactNode;
}) {
  const status = STATUS_META[task.status];
  return <li className="mirror-plan-task">
    <div className="mirror-plan-task__top">
      <div>
        <div className="mirror-task-row__title"><b>{task.title}</b><Pill tone={status.tone}>{status.label}</Pill><Pill tone={task.priority === 'high' ? 'coral' : task.priority === 'medium' ? 'amber' : 'muted'}>{task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}</Pill></div>
        <p>{task.detail}</p>
      </div>
      <span className="mirror-duration"><Clock3 size={14} />{task.durationMinutes} 分钟</span>
    </div>
    <div className="mirror-plan-task__evidence"><FileCheck2 size={14} /><span>完成证据：{task.evidence}</span></div>
    {task.deferReason ? <p className="mirror-defer-reason">{task.status === 'skipped' ? '跳过原因：' : '延后原因：'}{task.deferReason}</p> : null}
    <div className="mirror-plan-task__actions">
      {task.status === 'todo' ? <ActionButton tone="primary" onClick={() => dispatch({ type: 'start_task', id: task.id })} icon={<Play size={14} />}>开始</ActionButton> : null}
      {task.status === 'in_progress' ? <ActionButton tone="primary" onClick={() => dispatch({ type: 'complete_task', id: task.id })} icon={<Check size={14} />}>完成并记录证据</ActionButton> : null}
      {task.status !== 'done' && task.status !== 'deferred' && task.status !== 'skipped' ? <ActionButton tone="secondary" onClick={() => onAction({ taskId: task.id, kind: 'defer' })} icon={<CalendarClock size={14} />}>延后</ActionButton> : null}
      {task.status !== 'done' && task.status !== 'deferred' && task.status !== 'skipped' ? <ActionButton tone="secondary" onClick={() => onAction({ taskId: task.id, kind: 'skip' })} icon={<X size={14} />}>跳过</ActionButton> : null}
      {task.status !== 'done' && task.status !== 'deferred' && task.status !== 'skipped' && task.durationMinutes >= 20 ? <ActionButton tone="secondary" onClick={() => dispatch({ type: 'split_task', id: task.id })} icon={<Scissors size={14} />}>拆分</ActionButton> : null}
      <ActionButton tone="ghost" onClick={() => navigate(task.linkRoute as Route)} icon={<ArrowRight size={14} />}>打开关联页</ActionButton>
    </div>
    {panel}
  </li>;
}

function TaskActionPanel({ task, action, dispatch, onClose }: {
  task: DemoTask; action: Exclude<TaskAction, null>; onClose: () => void;
  dispatch: ReturnType<typeof useDemo>['dispatch'];
}) {
  return <div className="mirror-defer-panel" role="group" aria-label={`为${task.title}选择原因`}>
    {DEFER_REASON_OPTIONS.map(reason => <button type="button" key={reason} onClick={() => {
      dispatch(action.kind === 'defer'
        ? { type: 'defer_task', id: task.id, reason }
        : { type: 'skip_task', id: task.id, reason });
      onClose();
    }}>{reason}</button>)}
    <button type="button" onClick={onClose}>取消</button>
  </div>;
}

export function PlanPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const groups = selectPlanGroups(state);
  const summary = selectPlanSummary(state);
  const weekly = selectPlanWeeklyReview(state);
  const dateLabel = selectPlanDateLabel(state);
  const [action, setAction] = useState<TaskAction>(null);
  const [showWorkbench, setShowWorkbench] = useState(false);
  const utilization = Math.min(100, Math.round((summary.scheduledMinutes / Math.max(1, summary.capacityMinutes)) * 100));
  const slotHints: Record<string, string> = { 上午: '高优先级与理解任务优先', 下午: '材料、练习和阶段检查', 晚上: '记忆复盘与表达输出' };
  const splitCandidate = state.tasks.find(task => task.status !== 'done' && task.status !== 'deferred' && task.status !== 'skipped' && task.durationMinutes >= 20);

  return <div className="mirror-page mirror-page--wide mirror-page--plan">
    <Tabs active="plan" navigate={navigate} tabs={[{ route: 'plan', label: '今日计划' }, { route: 'study', label: '学习安排' }, { route: 'analytics', label: '周证据复盘' }]} />
    <PageHeader eyebrow="计划中心" title="计划" description="计划是受每日容量约束的行动队列，每项任务都说明完成证据。" navigate={navigate} action={<div className="mirror-date-switch"><button type="button" aria-label="前一天" onClick={() => dispatch({ type: 'change_plan_date', offset: state.planDateOffset - 1 })}><ArrowLeft size={15} /></button><span>{dateLabel} · 示例日期</span><button type="button" aria-label="后一天" onClick={() => dispatch({ type: 'change_plan_date', offset: state.planDateOffset + 1 })}><ArrowRight size={15} /></button></div>} />
    <SectionNav items={[{ id: 'plan-capacity', label: '容量与证据' }, { id: 'plan-adjustment', label: '自适应调整' }, { id: 'plan-tasks', label: '任务队列', badge: summary.scheduledMinutes }, { id: 'plan-review', label: '证据复盘' }]} />
    <WorkflowContextBar title="今日计划上下文" detail="容量、优先级与证据要求共同决定下一步，所有变化只存在于本次演示。" icon={<CalendarClock size={17} />} />

    <div className="mirror-plan-topline" id="plan-capacity">
      <Panel className="mirror-capacity-panel" title="每日容量" meta={`目标 ${state.profile.dailyMinutes} 分钟`}>
        <div className="mirror-capacity-numbers"><div><strong>{summary.scheduledMinutes}</strong><span>已安排分钟</span></div><div><strong>{summary.remainingMinutes}</strong><span>待完成分钟</span></div><div><strong>{summary.capacityMinutes}</strong><span>容量上限</span></div></div>
        <ProgressBar value={utilization} tone={utilization > 90 ? 'amber' : 'blue'} label={`已使用 ${utilization}%`} />
        <p className="mirror-note">{summary.scheduledMinutes > summary.capacityMinutes ? '当前安排已超过容量上限，请拆分、延后或跳过低优先级任务。' : '延期会释放时长，但保留原任务和原因；开始过的任务会在承接时留下记录。'}</p>
      </Panel>
      <Panel title="证据状态" meta="计划质量检查">
        <div className="mirror-evidence-grid"><Kpi label="已开始" value={summary.startedCount} hint="开始过的任务" tone="blue" /><Kpi label="证据任务" value={summary.evidenceCount} hint="要求可核验产出" tone="teal" /><Kpi label="已延后/跳过" value={summary.deferredCount} hint="需下一轮处理" tone="amber" /></div>
      </Panel>
    </div>

    <Panel id="plan-adjustment" className="mirror-adaptive" title="自适应调整" meta="根据容量与行为证据">
      <div className="mirror-adaptive__body"><SlidersHorizontal size={20} /><div><strong>{summary.scheduledMinutes > summary.capacityMinutes ? '今日安排已超过容量，需要重新分配。' : '今日安排尚未超载，但有一项阶段检查已延后。'}</strong><p>{splitCandidate ? `建议把「${splitCandidate.title}」拆成两个更小的动作，分别安排在不同时段。` : '当前没有适合拆分的待办任务，可先处理到期复习卡。'}</p></div><ActionButton tone="secondary" onClick={() => setShowWorkbench(value => !value)} icon={<ChevronDown size={15} />}>{showWorkbench ? '收起工作台' : '查看拆分工作台'}</ActionButton></div>
      {showWorkbench ? <div className="mirror-workbench"><div><Pill tone="blue">原任务</Pill><strong>{splitCandidate ? `${splitCandidate.title} · ${splitCandidate.durationMinutes} 分钟` : '暂无合适任务'}</strong></div><ArrowRight size={16} /><div><Pill tone="teal">拆分后</Pill><strong>{splitCandidate ? `两个独立动作 · 共 ${splitCandidate.durationMinutes} 分钟` : '—'}</strong></div>{splitCandidate ? <ActionButton tone="ghost" onClick={() => { dispatch({ type: 'split_task', id: splitCandidate.id }); setShowWorkbench(false); }} icon={<Check size={15} />}>采用示例安排</ActionButton> : null}</div> : null}
    </Panel>

    <div className="mirror-plan-groups" id="plan-tasks">
      {(['上午', '下午', '晚上'] as const).map(slot => <Panel key={slot} title={slot} meta={slotHints[slot]}>
        <ul className="mirror-plan-task-list">
          {groups[slot].map(task => <PlanTaskRow
            key={task.id}
            task={task}
            navigate={navigate}
            onAction={setAction}
            dispatch={dispatch}
            panel={action?.taskId === task.id ? <TaskActionPanel task={task} action={action} dispatch={dispatch} onClose={() => setAction(null)} /> : null}
          />)}
        </ul>
      </Panel>)}
    </div>

    <Panel id="plan-review" title="7 天证据复盘" meta="用实际完成与计划差异调整下一轮">
      <div className="mirror-week-review-grid">
        <Kpi label="计划分钟" value={weekly.plannedMinutes.toLocaleString('zh-CN')} hint="过去 7 天模板" tone="ink" />
        <Kpi label="实际分钟" value={weekly.completedMinutes.toLocaleString('zh-CN')} hint="已记录证据" tone="teal" />
        <Kpi label="完成率" value={`${weekly.completionRate}%`} hint="按任务证据" tone="blue" />
        <Kpi label="延后/跳过" value={weekly.deferredMinutes + weekly.skippedMinutes} hint="保留原因" tone="amber" />
      </div>
      <div className="mirror-next-steps"><strong>下一步（按证据排序）</strong><ol>{weekly.nextSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></div>
    </Panel>

    <Panel title="阶段时间表" meta={`${MIRROR_PROFILE.phase} · 标准安排`}><div className="mirror-phase-table"><div><span>当前阶段</span><strong>{MIRROR_PROFILE.phase}</strong></div><div><span>每日重点</span><strong>{MIRROR_PROFILE.phaseLabel}</strong></div><div><span>每周休息</span><strong>每周 1 天</strong></div><div><span>切换条件</span><strong>基础章节完成并有独立作答证据</strong></div></div></Panel>
  </div>;
}
