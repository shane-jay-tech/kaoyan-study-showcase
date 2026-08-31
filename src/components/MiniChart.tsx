import { useId } from 'react';
import type { PillTone } from './StatusPill';

export interface ChartPoint {
  label?: string;
  value: number;
  tone?: PillTone;
  highlight?: boolean;
}

export interface MiniChartProps {
  /** Plain values, or labelled/colored points. */
  data: number[] | ChartPoint[];
  height?: number;
  /** Default bar tone when points do not specify one. */
  tone?: PillTone;
  /** Index in `data` to emphasize (e.g. "today"). */
  highlightedIndex?: number;
  /** Accessible name for the chart. */
  ariaLabel: string;
  /** Render short x-axis labels below the bars. */
  showLabels?: boolean;
  /** Optional overlay line series (e.g. accuracy over minutes). */
  secondary?: number[];
  secondaryTone?: PillTone;
  unit?: string;
}

const TONE_VARS: Record<PillTone, string> = {
  blue: 'var(--color-blue)',
  teal: 'var(--color-teal)',
  amber: 'var(--color-amber)',
  coral: 'var(--color-coral)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-muted)',
};

const BAR_STEP = 30;
const PAD_X = 6;
const LABEL_AREA = 18;
const VALUE_AREA = 14;

function toPoints(data: number[] | ChartPoint[]): ChartPoint[] {
  return data.map(point => (typeof point === 'number' ? { value: point } : point));
}

/**
 * Compact dependency-free SVG bar chart with an optional overlay line.
 * Flat fills only (no gradients), fixed internal grid, accessible name.
 */
export function MiniChart({
  data,
  height = 128,
  tone = 'teal',
  highlightedIndex,
  ariaLabel,
  showLabels = false,
  secondary,
  secondaryTone = 'blue',
  unit = '',
}: MiniChartProps) {
  const titleId = useId();
  const points = toPoints(data);
  const count = points.length;
  const chartWidth = Math.max(120, count * BAR_STEP + PAD_X * 2);
  const plotHeight = height - LABEL_AREA - VALUE_AREA;
  const maxValue = Math.max(1, ...points.map(point => point.value), ...(secondary ?? []));
  const barWidth = BAR_STEP * 0.62;

  const secondaryPoints = secondary?.map((value, index) => {
    const x = PAD_X + index * BAR_STEP + BAR_STEP / 2;
    const y = LABEL_AREA + plotHeight - (value / maxValue) * (plotHeight - 6);
    return { x, y };
  }) ?? [];

  return (
    <svg
      className="mini-chart"
      viewBox={`0 0 ${chartWidth} ${height}`}
      role="img"
      aria-labelledby={titleId}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>{ariaLabel}</title>
      {points.map((point, index) => {
        const barHeight = Math.max(2, (point.value / maxValue) * (plotHeight - 6));
        const x = PAD_X + index * BAR_STEP + (BAR_STEP - barWidth) / 2;
        const y = LABEL_AREA + plotHeight - barHeight;
        const highlighted = index === highlightedIndex;
        const pointTone = point.tone ?? tone;
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={TONE_VARS[pointTone]}
              opacity={highlighted ? 1 : point.highlight === false ? 0.45 : 0.78}
            >
              <title>{`${point.label ?? index + 1}：${point.value}${unit}`}</title>
            </rect>
            {points.length <= 8 ? (
              <text
                x={PAD_X + index * BAR_STEP + BAR_STEP / 2}
                y={y - 4}
                textAnchor="middle"
                className="mini-chart__value"
              >
                {point.value}
              </text>
            ) : null}
            {showLabels && point.label ? (
              <text
                x={PAD_X + index * BAR_STEP + BAR_STEP / 2}
                y={height - 4}
                textAnchor="middle"
                className={`mini-chart__label${highlighted ? ' mini-chart__label--active' : ''}`}
              >
                {point.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {secondaryPoints.length >= 2 ? (
        <g>
          <polyline
            points={secondaryPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={TONE_VARS[secondaryTone]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {secondaryPoints.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r={2.5} fill={TONE_VARS[secondaryTone]}>
              <title>{`第 ${index + 1} 天：${secondary?.[index]}${unit}`}</title>
            </circle>
          ))}
        </g>
      ) : null}
    </svg>
  );
}
