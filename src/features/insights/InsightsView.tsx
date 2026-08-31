import { useMemo } from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { REVIEW_PRESSURE, SUBJECT_INSIGHTS } from '../../data/demo-fixtures';
import { useDemo } from '../../lib/demo-context';
import { selectActivity, selectRecommendation, type Route } from '../../lib/demo-state';
import { MiniChart } from '../../components/MiniChart';
import type { PillTone } from '../../components/StatusPill';

const TONE_VARS: Record<PillTone, string> = {
  blue: 'var(--color-blue)',
  teal: 'var(--color-teal)',
  amber: 'var(--color-amber)',
  coral: 'var(--color-coral)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-muted)',
};

export function InsightsView() {
  const { dispatch } = useDemo();
  const activity = useMemo(() => selectActivity(), []);
  const recommendation = useMemo(() => selectRecommendation(), []);

  return (
    <section className="view" aria-labelledby="insights-title">
      <header className="view-header">
        <div>
          <h1 id="insights-title" className="view-title">学习洞察</h1>
          <p className="view-subtitle">证据变成决策，而不是只展示图表。</p>
        </div>
      </header>

      <div className="insight-grid">
        <div className="card" aria-labelledby="subject-accuracy-title">
          <div className="card__header">
            <h2 id="subject-accuracy-title" className="card__title">学科正确率对比</h2>
            <span className="card__meta">近两周练习</span>
          </div>
          <ul className="accuracy-bars">
            {SUBJECT_INSIGHTS.map(item => (
              <li key={item.name} className="accuracy-bar">
                <span className="accuracy-bar__label">{item.name}</span>
                <span className="accuracy-bar__track" aria-hidden="true">
                  <span
                    className="accuracy-bar__fill"
                    style={{ width: `${item.accuracy}%`, background: TONE_VARS[item.tone] }}
                  />
                </span>
                <span className="accuracy-bar__value">{item.accuracy}%</span>
                <span className={`accuracy-bar__trend accuracy-bar__trend--${item.tone}`}>{item.trend}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" aria-labelledby="time-distribution-title">
          <div className="card__header">
            <h2 id="time-distribution-title" className="card__title">时长与正确率</h2>
            <span className="card__meta">柱：每日分钟 · 线：正确率</span>
          </div>
          <MiniChart
            data={activity.map(point => ({ label: point.label, value: point.minutes }))}
            tone="teal"
            secondary={activity.map(point => point.accuracy)}
            secondaryTone="blue"
            highlightedIndex={activity.length - 1}
            showLabels
            ariaLabel="近 14 天每日学习分钟数（柱）与正确率（线）"
            unit=" 分钟"
          />
        </div>
      </div>

      <div className="card" aria-labelledby="pressure-title">
        <div className="card__header">
          <h2 id="pressure-title" className="card__title">复习压力趋势</h2>
          <span className="card__meta">待复测项数量 · 近 14 天</span>
        </div>
        <MiniChart
          data={REVIEW_PRESSURE}
          tone="amber"
          highlightedIndex={REVIEW_PRESSURE.length - 1}
          ariaLabel="近 14 天待复测项数量趋势，整体呈下降"
        />
        <p className="card__footnote">峰值后回落，说明两轮复测机制正在清空积压。</p>
      </div>

      <div className="recommendation" aria-labelledby="recommendation-title">
        <div className="recommendation__icon" aria-hidden="true">
          <Lightbulb size={22} />
        </div>
        <div className="recommendation__body">
          <h2 id="recommendation-title" className="recommendation__title">证据建议</h2>
          <p className="recommendation__summary">{recommendation.summary}</p>
          <ul className="recommendation__observations">
            {recommendation.observations.map(observation => (
              <li key={observation}>{observation}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'navigate', route: recommendation.actionRoute as Route })}
        >
          {recommendation.actionLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
