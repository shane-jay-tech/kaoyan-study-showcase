import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  FileCheck2,
  FileQuestion,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Languages,
  Menu,
  PenLine,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { PUBLIC_DEMO_LABEL } from '../data/public-source-mirror';
import { useDemo } from '../lib/demo-context';
import { selectDaysRemaining, selectRouteLabel, type Route } from '../lib/demo-state';
import { MIRROR_PAGE_COMPONENTS } from '../features/mirror/MirrorPages';
import { CaseStudyView } from '../features/case-study/CaseStudyView';

const {
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
} = MIRROR_PAGE_COMPONENTS;

interface NavItem {
  route: Route;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
}

const NAV_GROUPS: NavItem[] = [
  { route: 'today', label: '首页', icon: LayoutDashboard },
  { route: 'plan', label: '计划', icon: CalendarDays },
  {
    route: 'study', label: '学习', icon: BookOpen,
    children: [
      { route: 'study-professional', label: '专业主线', icon: GraduationCap },
      { route: 'study-language', label: '语言训练', icon: Languages },
      { route: 'study-foundation', label: '公共基础', icon: BookOpen },
    ],
  },
  {
    route: 'practice', label: '练习', icon: PenLine,
    children: [
      { route: 'practice', label: '按题型练习', icon: PenLine },
      { route: 'past-exams', label: '历年试题', icon: FileQuestion },
      { route: 'exam', label: '模拟考试', icon: FileText },
    ],
  },
  {
    route: 'review', label: '复盘', icon: RotateCcw,
    children: [
      { route: 'review', label: '间隔复习', icon: RotateCcw },
      { route: 'wrong-questions', label: '错题本', icon: FileCheck2 },
      { route: 'expression', label: '主观表达', icon: PenLine },
    ],
  },
  {
    route: 'analytics', label: '数据与诊断', icon: BarChart3,
    children: [
      { route: 'analytics', label: '数据分析', icon: BarChart3 },
      { route: 'diagnosis', label: '能力诊断', icon: ShieldCheck },
    ],
  },
  {
    route: 'system', label: '系统与目标', icon: Settings,
    children: [
      { route: 'system', label: '系统状态', icon: Settings },
      { route: 'content-review', label: '内容治理', icon: FileCheck2 },
    ],
  },
];

const BOTTOM_ITEMS = NAV_GROUPS.slice(0, 5);

function routeMatches(route: Route, candidate: NavItem): boolean {
  if (route === candidate.route) return true;
  return candidate.children?.some(child => route === child.route) ?? false;
}

interface ViewBoundaryProps { onReset: () => void; children: ReactNode; }
interface ViewBoundaryState { hasError: boolean; }

class ViewBoundary extends Component<ViewBoundaryProps, ViewBoundaryState> {
  state: ViewBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ViewBoundaryState { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className="view-error" role="alert"><AlertTriangle size={28} aria-hidden="true" /><h2 className="view-error__title">界面渲染出现问题</h2><p className="view-error__text">可以重置演示数据后重试，不会影响其他内容。</p><button type="button" className="btn btn--primary" onClick={() => { this.setState({ hasError: false }); this.props.onReset(); }}><RefreshCw size={16} />重置演示</button></div>;
  }
}

function SidebarGroup({ item, route, navigate }: { item: NavItem; route: Route; navigate: (route: Route) => void }) {
  const [expanded, setExpanded] = useState(() => routeMatches(route, item));
  const Icon = item.icon;
  const active = routeMatches(route, item);
  return <div className={`sidebar-group${active ? ' is-active' : ''}`}>
    <button type="button" className={`nav-item${route === item.route ? ' nav-item--active' : ''}`} aria-current={route === item.route ? 'page' : undefined} onClick={() => { navigate(item.route); if (item.children) setExpanded(true); }}>
      <Icon size={18} aria-hidden="true" /><span>{item.label}</span>
      {item.children ? <ChevronDown size={15} className={`nav-group-chevron${expanded ? ' is-open' : ''}`} aria-hidden="true" onClick={event => { event.stopPropagation(); setExpanded(value => !value); }} /> : null}
    </button>
    {item.children && expanded ? <div className="nav-children">{item.children.map(child => { const ChildIcon = child.icon; return <button type="button" key={child.route} className={`nav-child${route === child.route ? ' is-active' : ''}`} aria-current={route === child.route ? 'page' : undefined} onClick={() => navigate(child.route)}><ChildIcon size={15} aria-hidden="true" /><span>{child.label}</span></button>; })}</div> : null}
  </div>;
}

function MobileDrawer({ open, route, navigate, close }: { open: boolean; route: Route; navigate: (route: Route) => void; close: () => void }) {
  if (!open) return null;
  return <><div className="mobile-drawer-overlay" aria-hidden="true" onClick={close} /><aside className="mobile-drawer" aria-label="导航菜单"><div className="mobile-drawer__head"><div><strong>考研学习工作台</strong><span>{PUBLIC_DEMO_LABEL}</span></div><button type="button" className="icon-button" aria-label="关闭导航菜单" onClick={close}><X size={20} /></button></div><nav>{NAV_GROUPS.map(item => { const ParentIcon = item.icon; return <div key={item.route}><button type="button" className={`mobile-nav-parent${routeMatches(route, item) ? ' is-active' : ''}`} onClick={() => { navigate(item.route); if (!item.children) close(); }}><ParentIcon size={18} /><span>{item.label}</span></button>{item.children ? <div className="mobile-nav-children">{item.children.map(child => { const ChildIcon = child.icon; return <button type="button" key={child.route} className={route === child.route ? 'is-active' : ''} onClick={() => { navigate(child.route); close(); }}><ChildIcon size={15} />{child.label}</button>; })}</div> : null}</div>; })}</nav><div className="mobile-drawer__foot"><ShieldCheck size={15} /><span>本页只展示脱敏固定数据</span></div></aside></>;
}

export interface AppShellProps { route: Route; navigate: (route: Route) => void; }

export function AppShell({ route, navigate }: AppShellProps) {
  const { dispatch } = useDemo();
  const [confirmReset, setConfirmReset] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const resetTimer = useRef<number | null>(null);
  useEffect(() => () => { if (resetTimer.current) window.clearTimeout(resetTimer.current); }, []);
  function requestReset() { setConfirmReset(true); if (resetTimer.current) window.clearTimeout(resetTimer.current); resetTimer.current = window.setTimeout(() => setConfirmReset(false), 6000); }
  function performReset() { if (resetTimer.current) window.clearTimeout(resetTimer.current); setConfirmReset(false); dispatch({ type: 'reset_demo' }); navigate('today'); setAnnouncement('演示数据已重置为初始状态'); }
  function openRoute(next: Route) { navigate(next); setDrawerOpen(false); }

  function renderView() {
    const props = { navigate: openRoute };
    switch (route) {
      case 'today': return <DashboardLoop {...props} />;
      case 'plan': return <PlanPage {...props} />;
      case 'study': return <StudyPage {...props} />;
      case 'study-professional': return <StudyPage {...props} trackId="professional" />;
      case 'study-language': return <StudyPage {...props} trackId="language" />;
      case 'study-foundation': return <StudyPage {...props} trackId="foundation" />;
      case 'practice': return <PracticePage {...props} />;
      case 'past-exams': return <PastExamsPage {...props} />;
      case 'exam': return <ExamPage {...props} />;
      case 'review': return <ReviewPage {...props} />;
      case 'wrong-questions': return <WrongQuestionsPage {...props} />;
      case 'expression': return <ExpressionPage {...props} />;
      case 'analytics': return <AnalyticsPage {...props} />;
      case 'diagnosis': return <DiagnosisPage {...props} />;
      case 'system': return <SystemPage {...props} />;
      case 'content-review': return <ContentReviewPage {...props} />;
      case 'case-study': return <CaseStudyView />;
      default: {
        const exhaustive: never = route;
        void exhaustive;
        return <section className="view"><h1 className="view-title">页面不存在</h1><div className="card module-placeholder"><p>未知演示路由，已回到安全状态。</p><button type="button" className="btn btn--secondary" onClick={() => openRoute('today')}><LayoutDashboard size={16} />回到首页</button></div></section>;
      }
    }
  }

  const activeLabel = selectRouteLabel(route);
  return <div className="app-shell" data-route={route}>
    <aside className="app-sidebar"><div className="sidebar-brand"><div className="sidebar-brand__mark"><GraduationCap size={19} /></div><div><span className="sidebar-brand__name">考研学习工作台</span><span className="sidebar-brand__label">{PUBLIC_DEMO_LABEL}</span></div></div><nav className="sidebar-nav" aria-label="主导航">{NAV_GROUPS.map(item => <SidebarGroup key={item.route} item={item} route={route} navigate={openRoute} />)}</nav><div className="sidebar-case-link"><button type="button" className={`nav-item${route === 'case-study' ? ' nav-item--active' : ''}`} onClick={() => openRoute('case-study')}><FileText size={18} /><span>产品案例</span></button></div><div className="sidebar-footer"><div className="sidebar-footer__target"><span>当前演示目标</span><strong>综合备考主线</strong><small>距阶段检查 {selectDaysRemaining()} 天</small></div><button type="button" className="nav-item sidebar-reset" onClick={requestReset}><RefreshCw size={16} /><span>重置演示</span></button><p className="sidebar-footer__note">数据仅存于内存，刷新即重置。</p></div></aside>
    <div className="app-main"><header className="app-topbar"><button type="button" className="icon-button" aria-label="打开导航菜单" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><Menu size={21} /></button><div className="topbar-brand"><span className="topbar-brand__name">{activeLabel}</span><span className="topbar-brand__label">综合备考主线 · {PUBLIC_DEMO_LABEL}</span></div><div className="topbar-actions"><button type="button" className="icon-button" aria-label="打开产品案例" onClick={() => openRoute('case-study')}><FileText size={19} /></button><button type="button" className="icon-button" aria-label="重置演示数据" onClick={requestReset}><RefreshCw size={19} /></button></div></header><MobileDrawer open={drawerOpen} route={route} navigate={openRoute} close={() => setDrawerOpen(false)} />{confirmReset ? <div className="reset-confirm" role="alertdialog" aria-label="重置演示数据确认"><span className="reset-confirm__text">重置后回到初始演示状态？</span><div className="reset-confirm__actions"><button type="button" className="btn btn--primary btn--compact" onClick={performReset}><Check size={16} />确认重置</button><button type="button" className="btn btn--ghost btn--compact" onClick={() => setConfirmReset(false)}><X size={16} />取消</button></div></div> : null}<main className="app-content"><ViewBoundary onReset={performReset}>{renderView()}</ViewBoundary></main><nav className="app-bottomnav" aria-label="主导航">{BOTTOM_ITEMS.map(item => { const Icon = item.icon; return <button type="button" key={item.route} className={`bottomnav-item${routeMatches(route, item) ? ' bottomnav-item--active' : ''}`} aria-current={routeMatches(route, item) ? 'page' : undefined} onClick={() => openRoute(item.route)}><Icon size={19} /><span>{item.label}</span></button>; })}</nav><p className="sr-only" role="status" aria-live="polite">{announcement}</p></div>
  </div>;
}
