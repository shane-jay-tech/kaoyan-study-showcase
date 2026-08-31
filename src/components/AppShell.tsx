import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  FileText,
  LayoutDashboard,
  PenLine,
  RefreshCw,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react';
import { PUBLIC_DEMO_LABEL } from '../data/demo-fixtures';
import { useDemo } from '../lib/demo-context';
import type { Route } from '../lib/demo-state';
import { IconButton } from './IconButton';
import { TodayView } from '../features/today/TodayView';
import { PlanView } from '../features/plan/PlanView';
import { InsightsView } from '../features/insights/InsightsView';
import PracticeView from '../features/practice/PracticeView';
import ReviewView from '../features/review/ReviewView';
import { CaseStudyView } from '../features/case-study/CaseStudyView';

const NAV_ITEMS: Array<{ route: Route; label: string; icon: LucideIcon }> = [
  { route: 'today', label: '今日', icon: LayoutDashboard },
  { route: 'plan', label: '计划', icon: CalendarDays },
  { route: 'practice', label: '练习', icon: PenLine },
  { route: 'review', label: '复习', icon: RotateCcw },
  { route: 'insights', label: '洞察', icon: BarChart3 },
];

const CASE_ITEM: { route: Route; label: string; icon: LucideIcon } = {
  route: 'case-study',
  label: '产品案例',
  icon: FileText,
};

interface ViewBoundaryProps {
  onReset: () => void;
  children: ReactNode;
}

interface ViewBoundaryState {
  hasError: boolean;
}

class ViewBoundary extends Component<ViewBoundaryProps, ViewBoundaryState> {
  state: ViewBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ViewBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="view-error" role="alert">
          <AlertTriangle size={28} aria-hidden="true" />
          <h2 className="view-error__title">界面渲染出现问题</h2>
          <p className="view-error__text">可以重置演示数据后重试，不会影响其他内容。</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            重置演示
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface AppShellProps {
  route: Route;
  navigate: (route: Route) => void;
}

export function AppShell({ route, navigate }: AppShellProps) {
  const { state, dispatch } = useDemo();
  const [confirmReset, setConfirmReset] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const resetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  function requestReset() {
    setConfirmReset(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setConfirmReset(false), 6000);
  }

  function performReset() {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    setConfirmReset(false);
    dispatch({ type: 'reset_demo' });
    navigate('today');
    setAnnouncement('演示数据已重置为初始状态');
  }

  function cancelReset() {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    setConfirmReset(false);
  }

  function renderView() {
    switch (route) {
      case 'today':
        return <TodayView />;
      case 'plan':
        return <PlanView />;
      case 'practice':
        return <PracticeView state={state} dispatch={dispatch} onNavigate={navigate} />;
      case 'review':
        return <ReviewView state={state} dispatch={dispatch} />;
      case 'insights':
        return <InsightsView />;
      case 'case-study':
        return <CaseStudyView />;
      default: {
        // Unreachable for the closed Route union (routeFromHash normalizes
        // unknown hashes to 'today'); kept as a type-safe safety net.
        const exhaustive: never = route;
        void exhaustive;
        return (
          <section className="view" aria-labelledby="unknown-route-title">
            <header className="view-header">
              <h1 id="unknown-route-title" className="view-title">页面不存在</h1>
            </header>
            <div className="card module-placeholder">
              <p>未知的演示路由，已回到安全状态。</p>
              <button type="button" className="btn btn--secondary" onClick={() => navigate('today')}>
                回到今日
              </button>
            </div>
          </section>
        );
      }
    }
  }

  return (
    <div className="app-shell" data-route={route}>
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand__name">考研智学系统</span>
          <span className="sidebar-brand__label">{PUBLIC_DEMO_LABEL}</span>
        </div>
        <nav className="sidebar-nav" aria-label="主导航">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                type="button"
                className={`nav-item${route === item.route ? ' nav-item--active' : ''}`}
                aria-current={route === item.route ? 'page' : undefined}
                onClick={() => navigate(item.route)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-nav sidebar-nav--sub">
          <button
            type="button"
            className={`nav-item${route === CASE_ITEM.route ? ' nav-item--active' : ''}`}
            aria-current={route === CASE_ITEM.route ? 'page' : undefined}
            onClick={() => navigate(CASE_ITEM.route)}
          >
            <CASE_ITEM.icon size={18} aria-hidden="true" />
            <span>{CASE_ITEM.label}</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <IconButton label="重置演示数据" icon={<RefreshCw size={18} aria-hidden="true" />} onClick={requestReset} />
          <p className="sidebar-footer__note">演示数据仅存于内存，刷新即重置。</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-brand">
            <span className="topbar-brand__name">考研智学系统</span>
            <span className="topbar-brand__label">{PUBLIC_DEMO_LABEL}</span>
          </div>
          <div className="topbar-actions">
            <IconButton
              label={CASE_ITEM.label}
              icon={<CASE_ITEM.icon size={20} aria-hidden="true" />}
              onClick={() => navigate(CASE_ITEM.route)}
            />
            <IconButton label="重置演示数据" icon={<RefreshCw size={20} aria-hidden="true" />} onClick={requestReset} />
          </div>
        </header>

        {confirmReset ? (
          <div className="reset-confirm" role="alertdialog" aria-label="重置演示数据确认">
            <span className="reset-confirm__text">重置后回到初始演示状态？</span>
            <div className="reset-confirm__actions">
              <button type="button" className="btn btn--primary btn--compact" onClick={performReset}>
                <Check size={16} aria-hidden="true" />
                确认重置
              </button>
              <button type="button" className="btn btn--ghost btn--compact" onClick={cancelReset}>
                <X size={16} aria-hidden="true" />
                取消
              </button>
            </div>
          </div>
        ) : null}

        <main className="app-content">
          <ViewBoundary onReset={performReset}>
            {renderView()}
          </ViewBoundary>
        </main>

        <nav className="app-bottomnav" aria-label="主导航">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                type="button"
                className={`bottomnav-item${route === item.route ? ' bottomnav-item--active' : ''}`}
                aria-current={route === item.route ? 'page' : undefined}
                onClick={() => navigate(item.route)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  );
}
