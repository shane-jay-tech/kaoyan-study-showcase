import type { PillTone } from './StatusPill';

export interface MetricTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: PillTone;
}

/**
 * One cell of the stable four-metric strip. Fixed heights keep the strip
 * dimensionally stable while demo state changes.
 */
export function MetricTile({ label, value, hint, tone = 'ink' }: MetricTileProps) {
  return (
    <div className="metric-tile">
      <span className="metric-tile__label">{label}</span>
      <span className={`metric-tile__value metric-tile__value--${tone}`}>{value}</span>
      {hint ? <span className="metric-tile__hint">{hint}</span> : null}
    </div>
  );
}
