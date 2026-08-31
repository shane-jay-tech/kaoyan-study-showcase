import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CheckCircle2,
  Flag,
  Info,
  Lightbulb,
  PenLine,
  Target,
} from 'lucide-react';
import { DIAGNOSIS_SAMPLES, DIAGNOSIS_STEPS } from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectActivity,
  selectAnalyticsPayload,
  selectDiagnosisReport,
  selectWrongBookItems,
} from '../../../lib/demo-state';
import { MiniChart } from '../../../components/MiniChart';
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

export function AnalyticsPage({ navigate }: MirrorPageProps) {
  const { state } = useDemo();
  const payload = selectAnalyticsPayload(state);
  const activity = selectActivity();
  const history = state.practice.history;
  const weak = payload.weakPoints.length ? payload.weakPoints : [];

  return <div className="mirror-page mirror-page--wide mirror-page--analytics">
    <Tabs active="analytics" navigate={navigate} tabs={[{ route: 'analytics', label: '数据分析' }, { route: 'diagnosis', label: '能力诊断' }]} />
    <PageHeader eyebrow="数据与诊断" title="数据分析" description="数字来自固定示例基线与本会话的练习、复习和错题状态。" navigate={navigate} action={<Pill tone="blue">本地计算</Pill>} />
    <SectionNav items={[{ id: 'analytics-summary', label: '数据概览' }, { id: 'analytics-trend', label: '正确率趋势' }, { id: 'analytics-weak', label: '薄弱点' }, { id: 'analytics-radar', label: '能力雷达' }]} />
    <WorkflowContextBar title="分析上下文" detail="做完一组练习后回到这里，数字会随本会话结果更新。" icon={<BarChart3 size={17} />} />
    <section className="mirror-kpi-grid" id="analytics-summary" aria-label="分析概览">
      <Kpi icon={<Target size={15} />} label="累计作答" value={payload.totalAnswers} hint="固定示例基线 + 本会话" tone="blue" />
      <Kpi icon={<Brain size={15} />} label="复习动作" value={payload.totalReviews} hint="知识卡评级累计" tone="amber" />
      <Kpi icon={<Check size={15} />} label="整体正确率" value={`${payload.overallAccuracy}%`} hint="按有效作答计算" tone="teal" />
      <Kpi icon={<Flag size={15} />} label="未解决错题" value={state.wrongBook.filter(item => !item.resolved).length} hint="保留原因与修复动作" tone="coral" />
    </section>
    <div className="mirror-two-col">
      <Panel id="analytics-trend" title="正确率趋势" meta="本会话练习 + 示例基线">
        <MiniChart data={history.length ? history.map(session => ({ label: session.label, value: Math.round((session.correct / Math.max(1, session.total)) * 100) })) : activity.map(point => ({ label: point.label, value: point.accuracy }))} tone="blue" secondary={activity.map(point => point.accuracy)} secondaryTone="teal" highlightedIndex={Math.max(0, history.length - 1)} showLabels ariaLabel="正确率趋势" unit="%" />
      </Panel>
      <Panel title="轨道正确率" meta="由作答历史计算">
        <div className="mirror-subject-insights">{payload.subjectAccuracy.map(item => <div key={item.subject}><div><strong>{item.subject}</strong><span>{item.accuracy}%</span></div><ProgressBar value={item.accuracy} tone="blue" /></div>)}</div>
      </Panel>
    </div>
    <Panel id="analytics-weak" title="薄弱点" meta="未解决错题与低正确率知识点">
      <div className="mirror-weak-list">{weak.map((item, index) => <div key={`${item.title}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.subject} · 已尝试 {item.attempts} 次 · 示例正确率 {item.accuracy}%</small></div><ActionButton tone="ghost" onClick={() => navigate('practice')} icon={<ArrowRight size={14} />}>去补救练习</ActionButton></div>)}</div>
    </Panel>
    <div className="mirror-two-col">
      <Panel id="analytics-radar" title="能力结构" meta="由掌握与作答状态推算">
        <div className="mirror-radar"><svg viewBox="0 0 240 160" role="img" aria-label="能力结构雷达图">{payload.radarData.map((item, index) => <line key={item.subject} x1="120" y1="80" x2={String(120 + 75 * Math.cos((index / 5) * Math.PI * 2 - Math.PI / 2))} y2={String(80 + 42 * Math.sin((index / 5) * Math.PI * 2 - Math.PI / 2))} stroke="currentColor" opacity=".2" />)}<polygon points={payload.radarData.map((item, index) => `${120 + 70 * (item.accuracy / 100) * Math.cos((index / 5) * Math.PI * 2 - Math.PI / 2)},${80 + 40 * (item.accuracy / 100) * Math.sin((index / 5) * Math.PI * 2 - Math.PI / 2)}`).join(' ')} fill="rgba(29,78,216,.18)" stroke="var(--color-blue)" strokeWidth="2" /></svg><div className="mirror-radar-legend"><div><span className="dot-blue" />当前表现</div>{payload.radarData.map(item => <p key={item.subject}><b>{item.subject}</b>{item.accuracy}%</p>)}<p>表达与迁移需要更多独立作答证据，建议下一轮各安排一项。</p></div></div>
      </Panel>
      <Panel title="本会话练习回看" meta="逐轮记录">
        <div className="mirror-analytics-history">{history.length === 0 ? <p className="mirror-note">还没有本会话练习记录，去按题型练习做一组后会出现在这里。</p> : history.map(session => <div key={session.id}><Pill tone={session.correct === session.total ? 'teal' : 'amber'}>{session.label}</Pill><strong>{session.correct}/{session.total} 对 · {session.score}/{session.maxScore} 分</strong><small>{session.trackLabel} · {session.questionType}</small></div>)}</div>
        <ActionButton tone="secondary" onClick={() => navigate('practice')} icon={<PenLine size={14} />}>开始一组练习</ActionButton>
      </Panel>
    </div>
  </div>;
}

export function DiagnosisPage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const activeStep = state.diagnosisStep;
  const report = selectDiagnosisReport(state);
  const history = state.practice.history;
  const openWrong = selectWrongBookItems(state).filter(item => !item.resolved).length;
  const samples = DIAGNOSIS_SAMPLES.map(sample => ({
    ...sample,
    sessions: sample.trackId === 'professional' ? sample.sessions + history.filter(session => session.trackLabel === '专业主线').reduce((sum, session) => sum + session.total, 0)
      : sample.trackId === 'language' ? sample.sessions + history.filter(session => session.trackLabel === '语言训练').reduce((sum, session) => sum + session.total, 0)
        : sample.sessions + history.filter(session => session.trackLabel === '公共基础').reduce((sum, session) => sum + session.total, 0),
  }));

  return <div className="mirror-page mirror-page--narrow mirror-page--diagnosis">
    <Tabs active="diagnosis" navigate={navigate} tabs={[{ route: 'analytics', label: '数据分析' }, { route: 'diagnosis', label: '能力诊断' }]} />
    <PageHeader eyebrow="数据与诊断" title="能力诊断" description="先确认样本，再解释模式，最后把结论转成下一步行动。" navigate={navigate} action={<Pill tone="amber">证据不足时不下结论</Pill>} />
    <SectionNav items={[{ id: 'diagnosis-flow', label: '诊断流程' }, { id: 'diagnosis-sample', label: '已确认样本' }, { id: 'diagnosis-action', label: '下一步行动' }, { id: 'diagnosis-boundary', label: '诊断边界' }]} />
    <WorkflowContextBar title="诊断上下文" detail="先检查样本完整性，再解释模式；公开版本不会把固定样本当作个人结论。" icon={<Lightbulb size={17} />} tone="amber" />
    <Panel id="diagnosis-flow" title="诊断流程" meta={`第 ${activeStep + 1} / 3 步`}>
      <div className="mirror-diagnosis-steps">{DIAGNOSIS_STEPS.map((step, index) => <div key={step.id} className={index <= activeStep ? 'is-active' : ''}><span>{index < activeStep ? <Check size={14} /> : index + 1}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div>{index < DIAGNOSIS_STEPS.length - 1 ? <i /> : null}</div>)}</div>
    </Panel>
    <div className="mirror-diagnosis-grid" id="diagnosis-sample">
      <Panel title="已确认样本" meta="固定示例 + 本会话证据">
        <div className="mirror-sample-list">{samples.map(sample => <div key={sample.trackId}><CheckCircle2 size={16} className="icon-teal" /><span>{sample.label} · {sample.sessions} 次作答</span><Pill tone={sample.accuracy >= 80 ? 'teal' : 'amber'}>{sample.accuracy}%</Pill></div>)}<div><CheckCircle2 size={16} className="icon-teal" /><span>本会话练习 · {history.length} 轮</span><Pill tone="teal">已记录</Pill></div><div><CheckCircle2 size={16} className="icon-teal" /><span>未解决错题 · {openWrong} 条</span><Pill tone="amber">待补救</Pill></div></div>
      </Panel>
      <Panel title="当前判断" meta="诊断草稿">
        <div className="mirror-diagnosis-conclusion"><Lightbulb size={20} /><div><strong>{activeStep >= 1 ? '迁移与表达的证据链仍不完整' : '正在收集基线样本'}</strong><p>{activeStep >= 1 ? '熟悉题型表现稳定，但换一种问法时容易遗漏限制条件；需要一次跨情境练习和一版结构化重写。' : '完成基线检查后再解释薄弱点。'}</p></div></div>
      </Panel>
    </div>
    {report ? <Panel id="diagnosis-report" title="诊断报告" meta="本会话生成"><div className="mirror-report"><h3>{report.title}</h3><p>{report.conclusion}</p><div><strong>证据</strong>{report.evidence.map(item => <span key={item}>{item}</span>)}</div><div><strong>行动</strong>{report.actions.map(item => <span key={item}>{item}</span>)}</div></div></Panel> : null}
    <Panel id="diagnosis-action" title="下一步行动" meta="诊断结果必须回到计划">
      <div className="mirror-diagnosis-actions"><div><Target size={19} /><strong>安排一次迁移练习</strong><span>比较不同表述下的解题过程</span></div><div><PenLine size={19} /><strong>完成一版结构重写</strong><span>用主张—依据—限制组织答案</span></div><ActionButton onClick={() => { if (activeStep >= 2) dispatch({ type: 'generate_diagnosis' }); else dispatch({ type: 'advance_diagnosis' }); navigate('plan'); }} icon={<ArrowRight size={15} />}>{activeStep >= 2 ? '应用建议并回到计划执行' : '确认并生成建议'}</ActionButton></div>
    </Panel>
    <Panel id="diagnosis-boundary" title="诊断边界" meta="公开镜像声明">
      <div className="mirror-disclaimer"><Info size={17} /><p>这里展示的是脱敏固定数据的诊断流程，不连接真实学习记录，也不代表任何人的能力结论。</p></div>
    </Panel>
  </div>;
}
