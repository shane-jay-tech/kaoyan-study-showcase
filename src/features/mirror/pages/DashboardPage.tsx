import {
  Archive,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Flag,
  ShieldCheck,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { KNOWLEDGE_POINTS, STUDY_TRACKS } from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectActivity,
  selectAnalyticsPayload,
  selectDashboardMetrics,
  selectDaysRemaining,
  selectNextAction,
  selectReviewDeckSummary,
  selectStudyStatus,
} from '../../../lib/demo-state';
import { formatMinutes } from '../../../lib/format';
import { MiniChart } from '../../../components/MiniChart';
import {
  ActionButton,
  Kpi,
  PageHeader,
  Panel,
  Pill,
  ProgressBar,
  SectionLink,
  StageStrip,
  TaskRow,
  type Tone,
} from '../primitives';
import type { MirrorPageProps } from '../MirrorPages';

export function DashboardLoop({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const metrics = selectDashboardMetrics(state);
  const next = selectNextAction(state);
  const daysLeft = selectDaysRemaining();
  const activity = selectActivity();
  const deck = selectReviewDeckSummary(state);
  const analytics = selectAnalyticsPayload(state);
  const completed = state.tasks.filter(task => task.status === 'done').length;
  const activeTasks = state.tasks.filter(task => task.status !== 'deferred' && task.status !== 'skipped');
  const deferredCount = state.tasks.filter(task => task.status === 'deferred' || task.status === 'skipped').length;
  const predicted = Math.max(0, state.profile.targetScore - Math.round(state.profile.targetScore * ((100 - analytics.overallAccuracy) / 100) * 0.4));
  const trackRows = STUDY_TRACKS.map(track => {
    const points = KNOWLEDGE_POINTS.filter(point => {
      const prefix = track.id === 'professional' ? 'pro-' : track.id === 'language' ? 'lang-' : 'base-';
      return point.chapterId.startsWith(prefix);
    });
    const mastered = points.filter(point => selectStudyStatus(state, point.id) === 'mastered').length;
    const accuracy = analytics.subjectAccuracy.find(item => item.subject === track.label)?.accuracy ?? 0;
    return { ...track, progress: Math.round((mastered / Math.max(1, points.length)) * 100), accuracy };
  });

  return <div className="mirror-page mirror-page--wide mirror-page--dashboard" data-testid="dashboard-root">
    <PageHeader eyebrow="学习工作台" title="学习工作台" description="今天先完成最重要的一步，再处理计划中的其余任务。" navigate={navigate} action={<div className="mirror-header-stats"><Pill tone="blue">{state.profile.targetScore}+ / 500 目标</Pill><Pill tone="teal">距考试 {daysLeft} 天</Pill></div>} />

    <div className="mirror-focus-grid">
      <Panel className="mirror-next-action" title="下一步行动" meta="根据今日计划与记忆压力排序">
        <div className="mirror-next-action__content"><div><h2>{next.label}</h2><p>{next.detail}</p><div className="mirror-next-action__tags"><Pill tone="blue">证据型任务</Pill><span>完成后会回写今日进度</span></div></div><ActionButton onClick={() => { const task = state.tasks.find(item => item.title === next.label); if (task && task.status === 'todo') dispatch({ type: 'start_task', id: task.id }); navigate(next.route); }} icon={<ArrowRight size={17} />}>打开下一步</ActionButton></div>
        <StageStrip active={2} />
      </Panel>
      <Panel className="mirror-today-tasks" title="今日任务" meta={`${completed}/${activeTasks.length} 项完成`}>
        <ul className="mirror-task-list">{activeTasks.slice(0, 4).map(task => <TaskRow key={task.id} task={task} dispatch={dispatch} navigate={navigate} compact />)}</ul>
        <SectionLink label="查看完整计划" route="plan" navigate={navigate} />
      </Panel>
    </div>

    <section className="mirror-kpi-grid" aria-label="今日进度">
      <Kpi icon={<Target size={15} />} label="今日任务" value={`${metrics.completedTasks}/${metrics.totalTasks}`} hint={`${metrics.completionPercent}% 已完成`} tone="blue" />
      <Kpi icon={<Clock3 size={15} />} label="有效学习" value={formatMinutes(metrics.completedMinutes)} hint={`计划 ${formatMinutes(metrics.plannedMinutes)}`} tone="teal" />
      <Kpi icon={<Brain size={15} />} label="记忆压力" value={`${deck.due} 张`} hint={deck.due > 0 ? `${deck.due} 张今天到期` : '当前无到期项'} tone={deck.due > 0 ? 'amber' : 'teal'} />
      <Kpi icon={<Target size={15} />} label="近期正确率" value={`${analytics.overallAccuracy}%`} hint="固定示例历史 + 本次会话" tone="ink" />
    </section>

    <div className="mirror-two-col mirror-dashboard-capacity-zone">
      <Panel className="mirror-dashboard-health" title="学习闭环健康" meta="由当前状态计算">
        <div className="mirror-health-row"><div className="mirror-health-score"><strong>{Math.max(40, Math.min(98, 60 + Math.round(metrics.completionPercent * 0.4)))}</strong><span>/ 100</span></div><div><Pill tone="teal">运行平稳</Pill><p>计划、作答、复测和洞察之间有可追踪连接。</p></div></div>
        <div className="mirror-health-list">
          {['计划有证据要求', '练习结果可带回复盘', '错题有延迟复测', '薄弱点能回到计划'].map((item, index) => <div key={item}><CheckCircle2 size={16} className="icon-teal" /><span>{item}</span><small>{index < 3 ? '已覆盖' : '待补一条表达证据'}</small></div>)}
        </div>
      </Panel>
      <Panel className="mirror-dashboard-capacity" title="记忆压力与训练容量" meta="今日恢复路线">
        <div className="mirror-capacity-summary"><div><span>知识卡到期</span><strong>{deck.due}</strong></div><div><span>词汇到期</span><strong>{deck.vocabularyDue}</strong></div><div><span>剩余容量</span><strong>{Math.max(0, state.profile.cardCapacity - deck.active)}</strong></div></div>
        <ProgressBar value={Math.round((deck.active / Math.max(1, state.profile.cardCapacity)) * 100)} tone="amber" label={`已使用 ${deck.active} / ${state.profile.cardCapacity} 张`} />
        <p className="mirror-note">建议先处理到期卡，再进入新内容；达到容量上限后不会继续塞入新卡。</p>
        <div className="mirror-inline-actions"><SectionLink label="去间隔复习" route="review" navigate={navigate} /><SectionLink label="看容量规则" route="plan" navigate={navigate} /></div>
      </Panel>
    </div>

    <div className="mirror-two-col mirror-dashboard-panorama">
      <Panel title="各轨道概览" meta="掌握与正确率">
        <div className="mirror-track-overview">
          {trackRows.map(item => <div key={item.id} className="mirror-track-row"><div><b>{item.label}</b><span>{item.progress}% 掌握</span></div><ProgressBar value={item.progress} tone={item.tone as Tone} /><strong>{item.accuracy}%</strong></div>)}
        </div>
        <SectionLink label="进入学习中心" route="study" navigate={navigate} />
      </Panel>
      <Panel title="近 14 天活动" meta="分钟与正确率">
        <MiniChart data={activity.map(point => ({ label: point.label, value: point.minutes }))} tone="teal" secondary={activity.map(point => point.accuracy)} secondaryTone="blue" highlightedIndex={activity.length - 1} showLabels ariaLabel="近 14 天每日有效学习时长与正确率" unit=" 分钟" />
      </Panel>
    </div>

    <div className="mirror-alert-grid">
      <Panel className="mirror-strategy" title="阶段策略" meta="基础巩固期">
        <div className="mirror-alert-content"><Flag size={18} /><div><strong>先保证理解和复测证据，再扩大题量</strong><p>当前阶段建议保持每日容量，优先处理高优先级任务与到期卡。</p></div><SectionLink label="打开计划" route="plan" navigate={navigate} /></div>
      </Panel>
      <Panel className="mirror-debt" title="待处理提醒" meta="不会自动隐藏">
        <div className="mirror-alert-content"><TriangleAlert size={18} /><div><strong>有 {deferredCount} 项任务已延后或跳过</strong><p>延期原因会保留在计划中，下一轮可重新安排或拆分。</p></div><SectionLink label="处理" route="plan" navigate={navigate} /></div>
      </Panel>
    </div>

    <div className="mirror-two-col mirror-dashboard-footer">
      <Panel className="mirror-dashboard-prediction" title="分数预测" meta="由当前正确率计算">
        <div className="mirror-prediction"><div className="mirror-prediction__value"><strong>{predicted}</strong><span>/ {state.profile.targetScore} 目标</span></div><ProgressBar value={Math.round((predicted / Math.max(1, state.profile.targetScore)) * 100)} tone="blue" label="基于当前证据的示例区间" /></div>
        <p className="mirror-note">这只是公开镜像的计算示例，不代表真实成绩或结果预测。</p>
      </Panel>
      <Panel className="mirror-dashboard-backup" title="备份与数据边界" meta="演示状态">
        <div className="mirror-health-row"><ShieldCheck size={22} className="icon-teal" /><div><strong>{state.backupCreated ? '示例备份已创建' : '建议建立一个备份提醒'}</strong><p>真实系统会在本地管理备份；这里仅展示产品状态，不写入文件。</p></div></div>
        <ActionButton tone="secondary" onClick={() => dispatch({ type: 'create_backup' })} icon={<Archive size={15} />}>{state.backupCreated ? '已完成示例动作' : '模拟创建备份'}</ActionButton>
      </Panel>
    </div>
  </div>;
}
