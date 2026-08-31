import { useMemo } from 'react';
import { ArrowRight, CalendarDays, Check, Clock } from 'lucide-react';
import { useDemo } from '../../lib/demo-context';
import {
  selectActivity,
  selectDashboardMetrics,
  selectDaysRemaining,
  selectNextAction,
  selectTodayTasks,
  selectTrack,
  type Route,
} from '../../lib/demo-state';
import { formatMinutes, formatPercent } from '../../lib/format';
import { MetricTile } from '../../components/MetricTile';
import { MiniChart } from '../../components/MiniChart';
import { StatusPill } from '../../components/StatusPill';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
};

export function TodayView() {
  const { state, dispatch } = useDemo();
  const metrics = useMemo(() => selectDashboardMetrics(state), [state]);
  const nextAction = useMemo(() => selectNextAction(state), [state]);
  const tasks = useMemo(() => selectTodayTasks(state), [state]);
  const track = useMemo(() => selectTrack(), []);
  const daysRemaining = useMemo(() => selectDaysRemaining(), []);
  const activity = useMemo(() => selectActivity(), []);

  function startNextAction() {
    dispatch({ type: 'navigate', route: nextAction.route as Route });
  }

  return (
    <section className="view" aria-labelledby="today-title">
      <header className="view-header">
        <div>
          <h1 id="today-title" className="view-title">今日学习</h1>
          <p className="view-subtitle">{track.subtitle}</p>
        </div>
        <div className="countdown" aria-label={`距离 ${track.examDate} 的考试还有 ${daysRemaining} 天`}>
          <CalendarDays size={18} aria-hidden="true" />
          <span className="countdown__value">{daysRemaining} 天</span>
          <span className="countdown__meta">距 {track.examDate} 考试</span>
        </div>
      </header>

      <div className="next-action">
        <div className="next-action__body">
          <span className="next-action__eyebrow">下一步行动</span>
          <h2 className="next-action__title">{nextAction.label}</h2>
          <p className="next-action__detail">{nextAction.detail}</p>
        </div>
        <button
          type="button"
          className="btn btn--on-primary"
          onClick={startNextAction}
        >
          开始
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="metric-strip" aria-label="今日学习指标">
        <MetricTile label="计划时长" value={formatMinutes(metrics.plannedMinutes)} tone="blue" />
        <MetricTile
          label="完成任务"
          value={`${metrics.completedTasks}/${metrics.totalTasks}`}
          hint={formatPercent(metrics.completionPercent)}
          tone="teal"
        />
        <MetricTile
          label="复习负载"
          value={String(metrics.reviewLoad)}
          hint={metrics.reviewLoad > 0 ? '项待处理' : '已清空'}
          tone={metrics.reviewLoad > 2 ? 'coral' : 'amber'}
        />
        <MetricTile label="近期正确率" value={formatPercent(metrics.accuracy)} tone="teal" />
      </div>

      <div className="card task-list" aria-labelledby="today-tasks-title">
        <div className="card__header">
          <h2 id="today-tasks-title" className="card__title">今日任务</h2>
          <span className="card__meta">{tasks.length} 项待完成</span>
        </div>
        {tasks.length === 0 ? (
          <p className="empty-note">今天的任务都完成了，去计划里看看明天的安排。</p>
        ) : (
          <ul className="task-list__items">
            {tasks.map(task => {
              const done = task.status === 'done';
              return (
                <li key={task.id} className={`task-row${done ? ' task-row--done' : ''}`}>
                  <button
                    type="button"
                    className={`task-check${done ? ' task-check--done' : ''}`}
                    aria-label={done ? `${task.title}（已完成）` : `完成任务：${task.title}`}
                    aria-pressed={done}
                    onClick={() => dispatch({ type: 'complete_task', id: task.id })}
                  >
                    {done ? <Check size={16} aria-hidden="true" /> : null}
                  </button>
                  <div className="task-row__body">
                    <div className="task-row__title-line">
                      <span className="task-row__title">{task.title}</span>
                      <StatusPill tone={done ? 'teal' : 'muted'}>{task.subject}</StatusPill>
                      {task.status === 'in_progress' ? (
                        <StatusPill tone="blue">进行中</StatusPill>
                      ) : null}
                    </div>
                    <div className="task-row__meta">
                      <span className="task-row__duration">
                        <Clock size={13} aria-hidden="true" />
                        {task.durationMinutes} 分钟
                      </span>
                      <span className={`task-row__priority task-row__priority--${task.priority}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span className="task-row__evidence">{task.evidence}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="card" aria-labelledby="activity-title">
        <div className="card__header">
          <h2 id="activity-title" className="card__title">近 14 天活动</h2>
          <span className="card__meta">每日有效学习时长</span>
        </div>
        <MiniChart
          data={activity.map(point => ({ label: point.label, value: point.minutes }))}
          tone="teal"
          highlightedIndex={activity.length - 1}
          showLabels
          ariaLabel="近 14 天每日有效学习时长（分钟），最后一天为今天"
          unit=" 分钟"
        />
        <p className="demo-note">示例数据来自虚构场景，刷新页面会恢复初始状态。</p>
      </div>
    </section>
  );
}
