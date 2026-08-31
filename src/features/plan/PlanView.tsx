import { useMemo, useState } from 'react';
import { Check, ChevronRight, Clock, X } from 'lucide-react';
import { DEFER_REASON_OPTIONS, WEEKLY_DISTRIBUTION } from '../../data/demo-fixtures';
import { useDemo } from '../../lib/demo-context';
import { selectPlanGroups, selectPlanSummary } from '../../lib/demo-state';
import { StatusPill, type PillTone } from '../../components/StatusPill';

const SLOT_GROUPS: Array<{ slot: '上午' | '下午' | '晚上'; hint: string }> = [
  { slot: '上午', hint: '高优先级任务优先安排' },
  { slot: '下午', hint: '研究阅读与阶段检查' },
  { slot: '晚上', hint: '记忆复盘与表达训练' },
];

const PRIORITY_META: Record<string, { label: string; tone: PillTone }> = {
  high: { label: '高优先级', tone: 'coral' },
  medium: { label: '中优先级', tone: 'amber' },
  low: { label: '低优先级', tone: 'muted' },
};

const STATUS_META: Record<string, { label: string; tone: PillTone }> = {
  todo: { label: '待开始', tone: 'muted' },
  in_progress: { label: '进行中', tone: 'blue' },
  done: { label: '已完成', tone: 'teal' },
  deferred: { label: '已延后', tone: 'amber' },
};

const TONE_VARS: Record<PillTone, string> = {
  blue: 'var(--color-blue)',
  teal: 'var(--color-teal)',
  amber: 'var(--color-amber)',
  coral: 'var(--color-coral)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-muted)',
};

export function PlanView() {
  const { state, dispatch } = useDemo();
  const summary = useMemo(() => selectPlanSummary(state), [state]);
  const groups = useMemo(() => selectPlanGroups(state), [state]);
  const [deferringId, setDeferringId] = useState<string | null>(null);

  const utilization = Math.min(100, summary.utilizationPercent);

  function closeDefer() {
    setDeferringId(null);
  }

  function confirmDefer(id: string, reason: string) {
    dispatch({ type: 'defer_task', id, reason });
    closeDefer();
  }

  return (
    <section className="view" aria-labelledby="plan-title">
      <header className="view-header">
        <div>
          <h1 id="plan-title" className="view-title">今日计划</h1>
          <p className="view-subtitle">按容量安排任务，而不是堆满一天。</p>
        </div>
      </header>

      <div className="card capacity-card" aria-labelledby="capacity-title">
        <div className="card__header">
          <h2 id="capacity-title" className="card__title">容量与安排</h2>
          {summary.deferredCount > 0 ? (
            <span className="capacity-card__note">已延后 {summary.deferredCount} 项</span>
          ) : null}
        </div>
        <div className="capacity-card__figures">
          <div className="capacity-figure">
            <span className="capacity-figure__value">{summary.scheduledMinutes}</span>
            <span className="capacity-figure__label">已安排（分钟）</span>
          </div>
          <div className="capacity-figure">
            <span className="capacity-figure__value">{summary.remainingMinutes}</span>
            <span className="capacity-figure__label">剩余（分钟）</span>
          </div>
          <div className="capacity-figure">
            <span className="capacity-figure__value">{summary.capacityMinutes}</span>
            <span className="capacity-figure__label">今日容量（分钟）</span>
          </div>
        </div>
        <div className="capacity-bar" aria-hidden="true">
          <div className="capacity-bar__fill" style={{ width: `${utilization}%` }} />
        </div>
        <p className="capacity-card__hint">
          已安排占用容量的 {utilization}%，延后任务会立即释放对应时长。
        </p>
      </div>

      <div className="plan-groups">
        {SLOT_GROUPS.map(({ slot, hint }) => {
          const tasks = groups[slot];
          return (
            <div key={slot} className="card plan-group" aria-labelledby={`plan-group-${slot}`}>
              <div className="card__header">
                <h2 id={`plan-group-${slot}`} className="card__title">{slot}</h2>
                <span className="card__meta">{hint}</span>
              </div>
              <ul className="plan-group__items">
                {tasks.map(task => {
                  const priority = PRIORITY_META[task.priority];
                  const status = STATUS_META[task.status];
                  const canAct = task.status === 'todo' || task.status === 'in_progress';
                  const deferring = deferringId === task.id;
                  return (
                    <li key={task.id} className="plan-task">
                      <div className="plan-task__main">
                        <div className="plan-task__title-line">
                          <span className="plan-task__title">{task.title}</span>
                          <StatusPill tone={status.tone}>{status.label}</StatusPill>
                          <StatusPill tone={priority.tone}>{priority.label}</StatusPill>
                          <StatusPill tone="muted">{task.subject}</StatusPill>
                        </div>
                        <div className="plan-task__meta">
                          <span className="plan-task__duration">
                            <Clock size={13} aria-hidden="true" />
                            {task.durationMinutes} 分钟
                          </span>
                          <span className="plan-task__evidence">证据要求：{task.evidence}</span>
                          {task.status === 'deferred' && task.deferReason ? (
                            <span className="plan-task__reason">延后原因：{task.deferReason}</span>
                          ) : null}
                        </div>
                      </div>
                      {canAct ? (
                        <div className="plan-task__actions">
                          <button
                            type="button"
                            className="btn btn--primary btn--compact"
                            onClick={() => dispatch({ type: 'complete_task', id: task.id })}
                          >
                            <Check size={16} aria-hidden="true" />
                            完成
                          </button>
                          <button
                            type="button"
                            className="btn btn--secondary btn--compact"
                            aria-expanded={deferring}
                            onClick={() => setDeferringId(deferring ? null : task.id)}
                          >
                            {deferring ? <X size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                            延后
                          </button>
                        </div>
                      ) : null}
                      {deferring ? (
                        <div className="defer-panel" role="group" aria-label={`为「${task.title}」选择延后原因`}>
                          <span className="defer-panel__prompt">延后原因（将保留在计划中）：</span>
                          <div className="defer-panel__options">
                            {DEFER_REASON_OPTIONS.map(reason => (
                              <button
                                key={reason}
                                type="button"
                                className="btn btn--ghost btn--compact"
                                onClick={() => confirmDefer(task.id, reason)}
                              >
                                {reason}
                              </button>
                            ))}
                            <button type="button" className="btn btn--ghost btn--compact" onClick={closeDefer}>
                              取消
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="card" aria-labelledby="weekly-title">
        <div className="card__header">
          <h2 id="weekly-title" className="card__title">本周时长分布</h2>
          <span className="card__meta">各学科占比</span>
        </div>
        <ul className="share-bars">
          {WEEKLY_DISTRIBUTION.map(item => (
            <li key={item.label} className="share-bar">
              <span className="share-bar__label">{item.label}</span>
              <span className="share-bar__track" aria-hidden="true">
                <span
                  className="share-bar__fill"
                  style={{ width: `${item.value}%`, background: TONE_VARS[item.color] }}
                />
              </span>
              <span className="share-bar__value">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
