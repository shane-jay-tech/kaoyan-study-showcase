import type { ReactNode } from 'react';

export type PillTone = 'blue' | 'teal' | 'amber' | 'coral' | 'ink' | 'muted';

export interface StatusPillProps {
  tone?: PillTone;
  children: ReactNode;
}

/** Small inline label used for task status, priority, and subject tags. */
export function StatusPill({ tone = 'ink', children }: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
