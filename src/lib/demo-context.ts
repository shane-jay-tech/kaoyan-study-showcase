import { createContext, useContext } from 'react';
import type { DemoAction, DemoState } from './demo-state';

export interface DemoContextValue {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
}

export const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoContext provider');
  }
  return context;
}
