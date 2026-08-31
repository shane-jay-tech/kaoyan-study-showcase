import { useState, type Dispatch } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Info,
  Languages,
  Play,
  Search,
} from 'lucide-react';
import {
  KNOWLEDGE_POINTS,
  MICRO_LESSONS,
  STUDY_CHAPTERS,
  STUDY_TRACKS,
  type KnowledgePoint,
} from '../../../data/public-source-mirror';
import { useDemo } from '../../../lib/demo-context';
import {
  selectMicroLessonStatus,
  selectStudyProgress,
  selectStudyStatus,
  type DemoAction,
  type KnowledgeStatus,
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
  STATUS_META,
  type Tone,
} from '../primitives';
import type { MirrorPageProps } from '../MirrorPages';

function pointStatusSummary(trackId: string, statuses: Record<string, KnowledgeStatus>) {
  const points = KNOWLEDGE_POINTS.filter(point => point.chapterId.startsWith(trackId === 'professional' ? 'pro-' : trackId === 'language' ? 'lang-' : 'base-'));
  const summary = { total: points.length, mastered: 0, learning: 0, review: 0, unseen: 0 };
  for (const point of points) {
    const status = statuses[point.id] || point.status;
    if (status === 'mastered') summary.mastered += 1;
    else if (status === 'learning') summary.learning += 1;
    else if (status === 'review') summary.review += 1;
    else summary.unseen += 1;
  }
  return summary;
}

function TrackOverviewCard({ track, navigate, statuses }: {
  track: typeof STUDY_TRACKS[number]; navigate: (route: Route) => void; statuses: Record<string, KnowledgeStatus>;
}) {
  const summary = pointStatusSummary(track.id, statuses);
  const progress = Math.round((summary.mastered / Math.max(1, summary.total)) * 100);
  return <button type="button" key={track.id} className={`mirror-track-card mirror-track-card--${track.tone}`} onClick={() => navigate(track.route as Route)}>
    <div className="mirror-track-card__icon">{track.id === 'professional' ? <GraduationCap size={21} /> : track.id === 'language' ? <Languages size={21} /> : <BookOpen size={21} />}</div>
    <div><strong>{track.label}</strong><p>{track.detail}</p><span>{summary.mastered}/{summary.total} 知识点已掌握 · {summary.review + summary.learning} 个需要继续</span></div>
    <div className="mirror-track-card__progress"><ProgressBar value={progress} tone={track.tone as Tone} label={`${progress}%`} /><ChevronRight size={18} /></div>
  </button>;
}

function MicroLessonPanel({ point, status, microStatus, dispatch }: {
  point: KnowledgePoint; status: KnowledgeStatus; microStatus: 'unseen' | 'in_progress' | 'done'; dispatch: Dispatch<DemoAction>;
}) {
  const lesson = MICRO_LESSONS.find(item => item.pointId === point.id);
  if (!lesson) return null;
  return <div className="mirror-micro-lesson">
    <div className="mirror-micro-lesson__head"><Pill tone="blue">微课</Pill><strong>{lesson.title}</strong><span>{point.sourceLabel}</span></div>
    <ol>{lesson.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol>
    <div className="mirror-micro-lesson__check"><Check size={15} />{lesson.check}</div>
    <ActionButton tone={microStatus === 'done' ? 'ghost' : 'primary'} onClick={() => {
      dispatch({ type: 'complete_micro_lesson', pointId: point.id });
      if (status === 'unseen') dispatch({ type: 'set_study_status', id: point.id, status: 'learning' });
    }} icon={<Check size={14} />}>{microStatus === 'done' ? '已核对，可再次查看' : '完成微课核对'}</ActionButton>
  </div>;
}

export function KnowledgePointRow({ point, status, dispatch, navigate }: {
  point: KnowledgePoint; status: KnowledgeStatus; dispatch: Dispatch<DemoAction>; navigate: (route: Route) => void;
}) {
  const meta = STATUS_META[status];
  const next: KnowledgeStatus = status === 'unseen' ? 'learning' : status === 'learning' ? 'review' : status === 'review' ? 'mastered' : 'mastered';
  return <article className="mirror-point-row">
    <div className="mirror-point-row__icon"><BrainCircuit size={17} /></div>
    <div className="mirror-point-row__body">
      <div className="mirror-point-row__title"><strong>{point.title}</strong><Pill tone={meta.tone}>{meta.label}</Pill><Pill tone={point.importance === 3 ? 'coral' : point.importance === 2 ? 'amber' : 'muted'}>重要度 {point.importance}/3</Pill><Pill tone="ink">{point.difficulty}</Pill></div>
      <p>{point.detail}</p>
      <span><FileCheck2 size={13} />{point.evidence} · {point.sourceLabel}</span>
      <div className="mirror-point-keywords">{point.keywords.map(keyword => <i key={keyword}>{keyword}</i>)}</div>
    </div>
    <div className="mirror-point-row__actions">
      <ActionButton tone={status === 'mastered' ? 'ghost' : 'secondary'} onClick={() => dispatch({ type: 'set_study_status', id: point.id, status: next })} icon={status === 'mastered' ? <Check size={14} /> : <ArrowRight size={14} />}>{status === 'mastered' ? '已掌握' : `标为${STATUS_META[next].label}`}</ActionButton>
      <ActionButton tone="ghost" onClick={() => {
        dispatch({ type: 'configure_practice', trackId: point.chapterId.startsWith('pro-') ? 'professional' : point.chapterId.startsWith('lang-') ? 'language' : 'foundation', chapterId: point.chapterId, questionType: 'single', count: 3, focusKnowledgePointId: point.id });
        navigate('practice');
      }} icon={<Play size={14} />}>去验证掌握</ActionButton>
    </div>
  </article>;
}

export function StudyPage({ navigate, trackId }: MirrorPageProps & { trackId?: string }) {
  const { state, dispatch } = useDemo();
  const [statusFilter, setStatusFilter] = useState<'all' | KnowledgeStatus>('all');
  const [query, setQuery] = useState('');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [openPoint, setOpenPoint] = useState<string | null>(null);
  const selectedTrack = trackId || 'professional';
  const track = STUDY_TRACKS.find(item => item.id === selectedTrack) || STUDY_TRACKS[0];
  const chapters = STUDY_CHAPTERS.filter(chapter => chapter.trackId === selectedTrack);
  const points = KNOWLEDGE_POINTS.filter(point => chapters.some(chapter => chapter.id === point.chapterId));
  const chapterProgress = chapters.map(chapter => ({ chapter, progress: selectStudyProgress(state, chapter.id) }));
  const summary = pointStatusSummary(selectedTrack, state.studyStatuses);
  const visiblePoints = points.filter(point => {
    const status = selectStudyStatus(state, point.id);
    const matchesFilter = statusFilter === 'all' || status === statusFilter;
    const matchesQuery = query.trim() === '' || point.title.includes(query.trim()) || point.keywords.some(keyword => keyword.includes(query.trim()));
    return matchesFilter && matchesQuery;
  });

  return <div className="mirror-page mirror-page--wide mirror-page--study">
    <Tabs active={track.route as Route} navigate={navigate} tabs={[{ route: 'study', label: '学习中心' }, ...STUDY_TRACKS.map(item => ({ route: item.route as Route, label: item.label }))]} />
    <PageHeader eyebrow="学习中心" title={trackId ? track.label : '学习'} description={track.detail} navigate={navigate} action={<Pill tone={track.tone as Tone}>{track.meta}</Pill>} />
    <SectionNav items={[{ id: 'study-chapters', label: '章节进度', badge: chapters.length }, { id: 'study-points', label: '知识点状态', badge: visiblePoints.length }]} />
    <WorkflowContextBar title={`${track.label}学习上下文`} detail="先学微课，再去做题验证掌握；状态由本会话练习结果推进。" icon={<BookOpen size={17} />} tone="teal" />
    {!trackId ? <div className="mirror-track-cards">{STUDY_TRACKS.map(item => <TrackOverviewCard key={item.id} track={item} navigate={navigate} statuses={state.studyStatuses} />)}</div> : null}
    <div className="mirror-study-summary"><Kpi label="章节知识点" value={summary.total} hint="当前轨道" tone="blue" /><Kpi label="已掌握" value={summary.mastered} hint={`${Math.round((summary.mastered / Math.max(1, summary.total)) * 100)}%`} tone="teal" /><Kpi label="学习中" value={summary.learning} hint="需要继续练习" tone="ink" /><Kpi label="需复习" value={summary.review} hint="进入验证练习" tone="amber" /></div>
    <Panel id="study-chapters" title={`${track.label} · 章节`} meta="从章节进入知识点与微课"><div className="mirror-chapter-grid">{chapterProgress.map(({ chapter, progress }) => { const expanded = expandedChapter === chapter.id; return <article className={`mirror-chapter-card${expanded ? ' is-expanded' : ''}`} key={chapter.id}><button type="button" className="mirror-chapter-card__head" onClick={() => setExpandedChapter(expanded ? null : chapter.id)}><div><Pill tone={chapter.status === 'active' ? 'blue' : chapter.status === 'done' ? 'teal' : 'muted'}>{chapter.status === 'active' ? '学习中' : chapter.status === 'done' ? '已完成' : '待进入'}</Pill><h3>{chapter.title}</h3><p>{chapter.subtitle}</p></div><ChevronDown size={17} className={expanded ? 'rotate-180' : ''} /></button><div className="mirror-chapter-progress"><ProgressBar value={Math.round((progress.mastered / Math.max(1, progress.total)) * 100)} tone={chapter.status === 'active' ? 'blue' : 'teal'} label={`${progress.mastered}/${progress.total} 已掌握`} /></div><div className="mirror-chapter-meta"><span>学习中 {progress.learning}</span><span>需复习 {progress.review}</span><span>未学习 {progress.total - progress.mastered - progress.learning - progress.review}</span></div>{expanded ? <div className="mirror-chapter-detail"><p>本章按“理解 → 微课核对 → 验证练习 → 掌握”推进。先去知识点页完成一条有效作答，再决定是否进入下一章。</p><ActionButton tone="secondary" onClick={() => document.getElementById('study-points')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} icon={<BookOpen size={14} />}>打开知识点列表</ActionButton></div> : null}</article>; })}</div></Panel>
    <Panel id="study-points" title="知识点状态" meta={`${visiblePoints.length} 条示例记录`}>
      <div className="mirror-filter-row" role="group" aria-label="按掌握状态筛选">
        {([['all', '全部'], ['unseen', '未学习'], ['learning', '学习中'], ['review', '需复习'], ['mastered', '已掌握']] as const).map(([value, label]) => <button type="button" key={value} className={statusFilter === value ? 'is-active' : ''} aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)}>{label}</button>)}
        <div className="mirror-search"><Search size={15} /><input aria-label="搜索知识点" placeholder="搜索标题或关键词" value={query} onChange={event => setQuery(event.target.value)} /></div>
      </div>
      <div className="mirror-point-list">
        {visiblePoints.map(point => {
          const status = selectStudyStatus(state, point.id);
          return <div key={point.id} className="mirror-point-entry">
            <KnowledgePointRow point={point} status={status} dispatch={dispatch} navigate={navigate} />
            {openPoint === point.id ? <MicroLessonPanel point={point} status={status} microStatus={selectMicroLessonStatus(state, point.id)} dispatch={dispatch} /> : <button type="button" className="mirror-collapse-trigger" onClick={() => setOpenPoint(point.id)}><BrainCircuit size={15} /><span>查看微课与掌握路径</span><ChevronDown size={15} /></button>}
          </div>;
        })}
      </div>
      {visiblePoints.length === 0 ? <div className="mirror-empty"><Info size={20} /><p>当前筛选没有知识点。</p></div> : null}
    </Panel>
  </div>;
}
