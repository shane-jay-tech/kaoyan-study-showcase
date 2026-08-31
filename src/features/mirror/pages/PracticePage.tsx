import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  ListChecks,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  STUDY_CHAPTERS,
  type PracticeQuestionType,
  type PracticeTrackId,
} from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectPracticeAnswer,
  selectPracticeProgress,
  selectPracticeQuestion,
} from '../../../lib/demo-state';
import {
  ActionButton,
  ConfigSelect,
  Kpi,
  PageHeader,
  Panel,
  Pill,
  ProgressBar,
  SectionNav,
  Tabs,
  WorkflowContextBar,
  type Tone,
} from '../primitives';
import type { MirrorPageProps } from '../MirrorPages';

const TRACK_OPTIONS: Array<{ value: PracticeTrackId | 'all'; label: string }> = [
  { value: 'all', label: '全部科目' },
  { value: 'professional', label: '专业主线' },
  { value: 'language', label: '语言训练' },
  { value: 'foundation', label: '公共基础' },
];

const TYPE_OPTIONS: Array<{ value: PracticeQuestionType; label: string; detail: string; tone: Tone }> = [
  { value: 'single', label: '单选题', detail: '4 选 1 · 适合快速检查', tone: 'blue' },
  { value: 'multi', label: '多选题', detail: '精确选择全部正确项', tone: 'teal' },
  { value: 'short', label: '简答题', detail: '按采分点查看结构反馈', tone: 'amber' },
  { value: 'verbatim', label: '默写训练', detail: '对照关键点检查遗漏', tone: 'coral' },
];

function optionLabel(type: PracticeQuestionType, index: number) {
  return String.fromCharCode(65 + index);
}

function PracticeSessionView({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const question = selectPracticeQuestion(state);
  const progress = selectPracticeProgress(state);
  const answer = question ? selectPracticeAnswer(state, question.id) : undefined;
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  if (!question) return null;
  const currentQuestion = question;
  const durationSeconds = Math.max(0, Math.round((now - startedAt) / 1000));
  const isText = currentQuestion.type === 'short' || currentQuestion.type === 'verbatim';
  const isMulti = currentQuestion.type === 'multi';
  const canSubmit = isText ? Boolean(answer?.text.trim()) : Boolean(answer && answer.selectedIndexes.length > 0);
  const submitted = answer?.submitted === true;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (submitted && (event.key === 'n' || event.key === 'N' || event.key === 'Enter')) {
      event.preventDefault();
      dispatch({ type: 'advance_question' });
      return;
    }
    if (!submitted && !isText && event.key === 'Enter') {
      if (canSubmit) dispatch({ type: 'submit_answer' });
      return;
    }
    if (!submitted && !isText && /^[a-hA-H]$/.test(event.key)) {
      const index = event.key.toLowerCase().charCodeAt(0) - 97;
      if (index < (currentQuestion.options?.length ?? 0)) dispatch({ type: 'toggle_option', index });
    }
  }

  return <div className="mirror-page mirror-page--runner mirror-page--practice-session" onKeyDown={handleKeyDown}>
    <PageHeader eyebrow="练习作答" title="练习进行中" description="提交后查看依据，再进入下一题；结果只用于本次公开演示。" navigate={navigate} action={<Pill tone="blue">第 {state.practice.currentIndex + 1} / {progress.total} 题</Pill>} />
    <div className="mirror-session-progress"><div><strong>第 {state.practice.currentIndex + 1} / {progress.total} 题</strong><span>{question.trackId === 'professional' ? '专业主线' : question.trackId === 'language' ? '语言训练' : '公共基础'} · {question.difficulty}</span></div><ProgressBar value={progress.percent} tone="blue" label={`${progress.answered}/${progress.total}`} /></div>
    {state.practice.config.focusKnowledgePointId ? <WorkflowContextBar title="掌握验证 · 锁定知识点" detail="本轮只验证该知识点的延迟保持与迁移；全部答对才会把知识点标为已掌握。" icon={<ShieldCheck size={17} />} tone="teal" /> : null}
    <Panel className="mirror-question-panel">
      <div className="mirror-question-meta"><Pill tone="blue">{question.id.toUpperCase()} · {TYPE_OPTIONS.find(item => item.value === question.type)?.label}</Pill><span>{question.sourceLabel}</span></div>
      <h2>{question.prompt}</h2>
      {isText ? <textarea className="mirror-practice-textarea" aria-label="练习作答" rows={6} placeholder={question.type === 'verbatim' ? '请默写完整内容...' : '请输入你的答案...'} value={answer?.text ?? ''} disabled={submitted} onChange={event => dispatch({ type: 'write_answer', text: event.target.value })} /> : <fieldset className="mirror-answer-list" disabled={submitted}><legend className="sr-only">选择答案</legend>{question.options?.map((option, index) => { const selected = answer?.selectedIndexes.includes(index) ?? false; const isCorrect = submitted && question.type === 'single' ? index === question.correctIndex : submitted && question.correctIndexes?.includes(index); return <label key={option} className={`mirror-answer${selected ? ' is-selected' : ''}${isCorrect ? ' is-correct' : ''}${submitted && selected && !isCorrect ? ' is-wrong' : ''}`}><input type={isMulti ? 'checkbox' : 'radio'} name="mirror-answer" checked={selected} onChange={() => dispatch({ type: 'toggle_option', index })} /><span className="mirror-answer__letter">{optionLabel(question.type, index)}</span><span>{option}</span>{isCorrect ? <CheckCircle2 size={17} /> : null}</label>; })}</fieldset>}
      {submitted && answer ? <div className={`mirror-feedback ${answer.score >= answer.maxScore ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite"><div><strong>{answer.score >= answer.maxScore ? '回答正确' : '这次需要再看一遍'}</strong><span>{isText ? `示例评分：${answer.score} / ${answer.maxScore} 分` : `正确答案：${question.answer}`}</span></div><p>{question.explanation}</p>{answer.missedPoints.length ? <div className="mirror-missed-points"><small>未覆盖的采分点：</small><ul>{answer.missedPoints.map(point => <li key={point}>{point}</li>)}</ul></div> : null}{isText ? <div className="mirror-reference-answer"><small>参考边界：</small><p>{question.answer}</p></div> : null}<small>主动用时 {durationSeconds} 秒（示例计时）</small></div> : <p className="mirror-note">{isMulti ? '选择一个或多个选项后提交，系统会精确比对答案组合。' : isText ? '提交后系统会按采分点、关键词和长度给出示例评分，不连接在线模型。' : '选择一个答案后提交，系统会给出固定的解释与关联知识区。'}</p>}
      <div className="mirror-session-actions">{!submitted ? <ActionButton disabled={!canSubmit} onClick={() => dispatch({ type: 'submit_answer' })} icon={<Check size={15} />}>提交答案</ActionButton> : <ActionButton onClick={() => dispatch({ type: 'advance_question' })} icon={<ArrowRight size={15} />}>{state.practice.currentIndex < progress.total - 1 ? '下一题' : '查看本轮结果'}</ActionButton>}<ActionButton tone="ghost" onClick={() => dispatch({ type: 'configure_practice', trackId: state.practice.config.trackId, chapterId: state.practice.config.chapterId, questionType: state.practice.config.questionType, count: state.practice.config.count, focusKnowledgePointId: state.practice.config.focusKnowledgePointId })} icon={<RotateCcw size={15} />}>退出本轮</ActionButton></div>
      {!isText ? <p className="mirror-keyboard-hint">快捷键：A-H 选择{isMulti ? '（再按一次取消）' : ''} · Enter 提交 · N 下一题</p> : null}
    </Panel>
  </div>;
}

function PracticeResultView({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const progress = selectPracticeProgress(state);
  const questions = state.practice.questions;
  const rows = questions.map(question => {
    const answer = state.practice.answers[question.id];
    return { question, answer, correct: Boolean(answer && answer.score >= answer.maxScore) };
  });
  const correctCount = rows.filter(row => row.correct).length;
  const score = rows.reduce((sum, row) => sum + (row.answer?.score ?? 0), 0);
  const maxScore = rows.reduce((sum, row) => sum + (row.answer?.maxScore ?? 0), 0);
  const finished = state.practice.history.length > 0 && state.practice.phase === 'complete';

  function reconfigure() {
    dispatch({
      type: 'configure_practice',
      trackId: state.practice.config.trackId,
      chapterId: state.practice.config.chapterId,
      questionType: state.practice.config.questionType,
      count: state.practice.config.count,
      focusKnowledgePointId: state.practice.config.focusKnowledgePointId,
    });
  }

  return <div className="mirror-page mirror-page--runner mirror-page--practice-result">
    <PageHeader eyebrow="练习结果" title={finished ? '本轮已记录' : '本轮答题回顾'} description="结果会指出下一步需要复测或继续巩固的内容。" navigate={navigate} action={<Pill tone="teal">固定示例结果</Pill>} />
    <Panel className="mirror-result-panel">
      <div className={`mirror-result-icon ${correctCount === progress.total ? 'is-good' : 'is-alert'}`}>{correctCount === progress.total ? <Check size={30} /> : <AlertTriangle size={30} />}</div>
      <h2>完成 {progress.total} 道练习</h2>
      <div className="mirror-result-score"><strong>{correctCount}</strong><span> / {progress.total} 题答对</span></div>
      <p>{correctCount === progress.total ? '本轮全部答对，可以继续保持并在稍后复测。' : `有 ${progress.total - correctCount} 道题需要再看一遍，记录后会把错题带回错题本。`}</p>
      <div className="mirror-result-grid"><Kpi label="已作答" value={`${progress.answered}/${progress.total}`} tone="ink" /><Kpi label="示例得分" value={`${score}/${maxScore}`} tone="blue" /><Kpi label="待补救" value={progress.total - correctCount} tone="amber" /></div>
      <div className="mirror-result-actions">
        {!finished && correctCount < progress.total ? <ActionButton onClick={() => dispatch({ type: 'finish_practice' })} icon={<RotateCcw size={15} />}>加入复习队列</ActionButton> : null}
        {!finished && correctCount === progress.total ? <ActionButton onClick={() => dispatch({ type: 'finish_practice' })} icon={<Check size={15} />}>记录本轮结果</ActionButton> : null}
        {finished ? <ActionButton tone="secondary" onClick={() => navigate('review')} icon={<ArrowRight size={15} />}>查看复习队列</ActionButton> : null}
        {finished ? <ActionButton tone="secondary" onClick={() => navigate('wrong-questions')} icon={<ArrowRight size={15} />}>去错题本</ActionButton> : null}
        {!finished ? <ActionButton tone="secondary" onClick={reconfigure} icon={<RefreshCw size={15} />}>重新配置</ActionButton> : null}
      </div>
    </Panel>
    <Panel title="本次答题回顾" meta="逐题记录">
      <div className="mirror-practice-review-list">{rows.map((row, index) => <div key={row.question.id} className={`mirror-practice-review-item ${row.correct ? 'is-correct' : 'is-wrong'}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{row.question.prompt}</strong><p>{TYPE_OPTIONS.find(item => item.value === row.question.type)?.label} · {row.answer ? `${row.answer.score}/${row.answer.maxScore} 分` : '未作答'} · {row.correct ? '回答正确' : '需要再看一遍'}</p></div><Pill tone={row.correct ? 'teal' : 'coral'}>{row.correct ? '已覆盖' : '待补救'}</Pill></div>)}</div>
    </Panel>
  </div>;
}

export function PracticePage({ navigate }: MirrorPageProps) {
  const { state, dispatch } = useDemo();
  const config = state.practice.config;
  const chapters = STUDY_CHAPTERS.filter(chapter => config.trackId === 'all' || chapter.trackId === config.trackId);
  const focusPoint = config.focusKnowledgePointId;

  if (state.practice.phase === 'active') return <PracticeSessionView navigate={navigate} />;
  if (state.practice.phase === 'complete') return <PracticeResultView navigate={navigate} />;

  function updateConfig(patch: Partial<typeof config>) {
    dispatch({
      type: 'configure_practice',
      trackId: patch.trackId ?? config.trackId,
      chapterId: patch.chapterId ?? 'all',
      questionType: patch.questionType ?? config.questionType,
      count: patch.count ?? config.count,
      focusKnowledgePointId: patch.focusKnowledgePointId,
    });
  }

  return <div className="mirror-page mirror-page--wide mirror-page--practice">
    <Tabs active="practice" navigate={navigate} tabs={[{ route: 'practice', label: '按题型练习' }, { route: 'past-exams', label: '历年试题' }, { route: 'exam', label: '模拟考试' }]} />
    <PageHeader eyebrow="练习中心" title="按题型练习" description="选择出题范围，开始一组可回到复盘的练习。" navigate={navigate} action={<Pill tone="blue">本地规则评分</Pill>} />
    <SectionNav items={[{ id: 'practice-config', label: '练习设置' }, { id: 'practice-types', label: '可用题型' }, { id: 'practice-after', label: '练习去向' }]} />
    <WorkflowContextBar title="练习上下文" detail="范围、题型和数量在本次演示中生效；客观题按答案比对，主观题按采分点示例评分。" icon={<SlidersHorizontal size={17} />} />
    {focusPoint ? <Panel className="mirror-focus-practice" title="掌握验证模式" meta="从知识点进入"><div><Pill tone="teal">锁定知识点：{focusPoint}</Pill><p>本轮只抽取映射到该知识点的题目；全部答对后知识点会标为已掌握。</p><ActionButton tone="ghost" onClick={() => updateConfig({ focusKnowledgePointId: undefined })} icon={<RotateCcw size={14} />}>退出验证模式</ActionButton></div></Panel> : null}
    <div className="mirror-practice-layout">
      <Panel id="practice-config" className="mirror-practice-config" title="开始一组练习" meta="所有设置仅在本次演示中生效">
        <ConfigSelect label="出题方式" value="固定题库" options={['固定题库']} onChange={() => {}} />
        <ConfigSelect label="选择科目" value={TRACK_OPTIONS.find(item => item.value === config.trackId)?.label ?? '全部科目'} options={TRACK_OPTIONS.map(item => item.label)} onChange={label => { const track = TRACK_OPTIONS.find(item => item.label === label); updateConfig({ trackId: track?.value ?? 'all', chapterId: 'all' }); }} />
        <ConfigSelect label="选择章节" value={config.chapterId === 'all' ? '全部章节' : chapters.find(chapter => chapter.id === config.chapterId)?.title ?? '全部章节'} options={['全部章节', ...chapters.map(chapter => chapter.title)]} onChange={label => { const chapter = chapters.find(item => item.title === label); updateConfig({ chapterId: chapter?.id ?? 'all' }); }} />
        <ConfigSelect label="选择题型" value={TYPE_OPTIONS.find(item => item.value === config.questionType)?.label ?? '单选题'} options={TYPE_OPTIONS.map(item => item.label)} onChange={label => { const type = TYPE_OPTIONS.find(item => item.label === label); updateConfig({ questionType: type?.value ?? 'single' }); }} />
        <div className="mirror-config-field"><label>练习数量</label><div className="mirror-count-options">{[3, 5, 10].map(value => <button type="button" key={value} className={config.count === value ? 'is-active' : ''} onClick={() => updateConfig({ count: value })}>{value} 题</button>)}</div></div>
        <ActionButton onClick={() => dispatch({ type: 'start_practice' })} icon={<Play size={16} />}>开始练习</ActionButton>
        <p className="mirror-note"><ShieldCheck size={14} />题目、答案和反馈来自本地固定示例，不连接在线服务。</p>
      </Panel>
      <div className="mirror-practice-side">
        <Panel id="practice-types" title="可用题型" meta="与当前系统入口对应">
          <div className="mirror-type-list">{TYPE_OPTIONS.map(item => <button type="button" key={item.value} className={config.questionType === item.value ? 'is-selected' : ''} onClick={() => updateConfig({ questionType: item.value })}><span className={`mirror-type-icon mirror-type-icon--${item.tone}`}>{item.value === 'single' ? <CheckCircle2 size={17} /> : item.value === 'multi' ? <ListChecks size={17} /> : item.value === 'short' ? <FileText size={17} /> : <ClipboardCheck size={17} />}</span><div><strong>{item.label}</strong><p>{item.detail}</p></div><ChevronRight size={15} /></button>)}</div>
        </Panel>
        <Panel id="practice-after" title="练习后的去向" meta="结果不会停在本页">
          <div className="mirror-route-list"><div><span>01</span><b>提交答案</b><small>看到解析与采分点</small></div><div><span>02</span><b>查看结果</b><small>错题写回错题本</small></div><div><span>03</span><b>回到计划</b><small>记录下一步证据</small></div></div>
        </Panel>
        {state.practice.history.length > 0 ? <Panel title="本会话练习历史" meta="固定示例会话"><div className="mirror-history-mini">{state.practice.history.map(session => <div key={session.id}><span>{session.label}</span><strong>{session.correct}/{session.total} 对</strong><small>{session.trackLabel} · {session.questionType}</small></div>)}</div></Panel> : null}
      </div>
    </div>
    <div className="mirror-practice-footer-note"><Clock3 size={14} /><span>快捷键在作答页生效；主动用时为前端计时示例，刷新后不保留。</span></div>
  </div>;
}
