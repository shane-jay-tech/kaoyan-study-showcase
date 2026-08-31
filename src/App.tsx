import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  createInitialState,
  demoReducer,
  hashForRoute,
  routeFromHash,
  selectActivity,
  selectDashboardMetrics,
  selectNextAction,
  selectPlanSummary,
  selectReviewSummary,
  selectTrack,
  type DemoAction,
  type Route,
} from './lib/demo-state';
import { DemoContext } from './lib/demo-context';
import { AppShell } from './components/AppShell';

export { ROUTES, routeFromHash, hashForRoute } from './lib/demo-state';
export { DemoContext, useDemo, type DemoContextValue } from './lib/demo-context';

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function navigate(nextRoute: Route) {
    window.location.hash = hashForRoute(nextRoute);
    setRoute(nextRoute);
  }

  return [route, navigate];
}

export function useDemoState() {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const metrics = useMemo(() => selectDashboardMetrics(state), [state]);
  const nextAction = useMemo(() => selectNextAction(state), [state]);
  const planSummary = useMemo(() => selectPlanSummary(state), [state]);
  const reviewSummary = useMemo(() => selectReviewSummary(state), [state]);
  const track = useMemo(() => selectTrack(), []);
  const activity = useMemo(() => selectActivity(), []);
  return { state, dispatch, metrics, nextAction, planSummary, reviewSummary, track, activity };
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const [state, rawDispatch] = useReducer(demoReducer, undefined, createInitialState);

  const dispatch = (action: DemoAction) => {
    if (action.type === 'navigate') navigate(action.route);
    else rawDispatch(action);
  };

  useEffect(() => {
    if (state.route !== route) rawDispatch({ type: 'navigate', route });
  }, [state.route, route]);

  return (
    <DemoContext.Provider value={{ state, dispatch }}>
      <AppShell route={route} navigate={navigate} />
    </DemoContext.Provider>
  );
}
