import type { Dispatch } from 'react';
import type { ReviewItem } from '../../data/demo-fixtures';
import {
  selectActiveReviewItems,
  selectClearedReviewItems,
  selectReviewSummary,
  selectStatusLabel,
  type DemoAction,
  type DemoState,
} from '../../lib/demo-state';

export interface ReviewViewProps {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
}

const STAGE_LABELS: Record<ReviewItem['stage'], string> = {
  0: '第一次复测',
  1: '第二次复测',
  2: '已完成两轮',
};

function ConfidenceControl({
  item,
  dispatch,
}: {
  item: ReviewItem;
  dispatch: Dispatch<DemoAction>;
}) {
  return (
    <div className="review-confidence">
      <span className="review-control-label" id={`${item.id}-confidence-label`}>信心等级</span>
      <div className="review-confidence-options" role="group" aria-labelledby={`${item.id}-confidence-label`}>
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            type="button"
            className={`confidence-button${item.confidence === level ? ' is-selected' : ''}`}
            aria-label={`信心等级 ${level}`}
            aria-pressed={item.confidence === level}
            onClick={() => dispatch({ type: 'set_review_confidence', id: item.id, confidence: level })}
            data-testid={`review-confidence-${item.id}-${level}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ item, dispatch }: { item: ReviewItem; dispatch: Dispatch<DemoAction> }) {
  const active = item.status !== 'cleared';
  const statusLabel = selectStatusLabel(item.status);

  return (
    <article className={`review-card review-card-${item.status}`} data-testid={`review-item-${item.id}`}>
      <header className="review-card-heading">
        <div>
          <span className="status-pill">{statusLabel}</span>
          <h3>{item.title}</h3>
          <p className="muted-text">{item.subject} · {item.dueLabel}</p>
        </div>
        <span className="review-stage">{STAGE_LABELS[item.stage]}</span>
      </header>

      <p className="review-reason"><strong>进入原因：</strong>{item.reason}</p>
      <div className="review-milestones" aria-label={`复测进度：${item.stage} / 2`}>
        {[0, 1].map(milestone => (
          <span key={milestone} className={item.stage > milestone ? 'is-complete' : ''}>
            <span aria-hidden="true">{item.stage > milestone ? '✓' : milestone + 1}</span>
            {milestone === 0 ? '首次证据' : '再次证据'}
          </span>
        ))}
      </div>

      <div className="review-card-footer">
        <ConfidenceControl item={item} dispatch={dispatch} />
        <span className="review-attempts">已复测 {item.attempts} 次 · {item.lastResult}</span>
      </div>

      {active ? (
        <div className="review-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => dispatch({ type: 'retest_review', id: item.id, correct: true })}
            data-testid={`review-pass-${item.id}`}
          >
            复测通过
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => dispatch({ type: 'retest_review', id: item.id, correct: false })}
            data-testid={`review-fail-${item.id}`}
          >
            需要重练
          </button>
        </div>
      ) : (
        <p className="review-cleared-note" role="status">已完成两次独立复测，这条记录已关闭。</p>
      )}
    </article>
  );
}

export default function ReviewView({ state, dispatch }: ReviewViewProps) {
  const summary = selectReviewSummary(state);
  const activeItems = selectActiveReviewItems(state);
  const clearedItems = selectClearedReviewItems(state);

  return (
    <section className="review-view" aria-labelledby="review-title">
      <header className="view-heading review-heading">
        <div>
          <p className="eyebrow">延迟复测 · 证据闭环</p>
          <h1 id="review-title">复习队列</h1>
          <p className="view-description">一次答对只会进入观察；第二次独立复测通过后，才真正关闭。</p>
        </div>
        <span className="demo-note">状态只在本次演示中保留</span>
      </header>

      <div className="review-summary" aria-label="复习队列摘要">
        <div className="review-summary-item review-summary-due"><strong>{summary.due}</strong><span>待复测</span></div>
        <div className="review-summary-item review-summary-watch"><strong>{summary.watch}</strong><span>观察中</span></div>
        <div className="review-summary-item review-summary-cleared"><strong>{summary.cleared}</strong><span>已关闭</span></div>
      </div>

      <div className="review-disclosure" role="note">
        <strong>复测规则</strong>
        <span>通过一轮会保留记录并进入观察；答错会回到待复测，并留下“需重练”原因。</span>
      </div>

      {activeItems.length > 0 ? (
        <div className="review-section">
          <div className="section-heading">
            <h2>当前队列</h2>
            <span>{summary.active} 条需要行动</span>
          </div>
          <div className="review-list">
            {activeItems.map(item => <ReviewCard key={item.id} item={item} dispatch={dispatch} />)}
          </div>
        </div>
      ) : (
        <div className="review-empty" role="status">
          <h2>当前没有待处理项目</h2>
          <p>新的错题会在练习完成后进入这里。</p>
        </div>
      )}

      {clearedItems.length > 0 ? (
        <div className="review-section review-cleared-section">
          <div className="section-heading">
            <h2>已关闭</h2>
            <span>保留证据记录</span>
          </div>
          <div className="review-list">
            {clearedItems.map(item => <ReviewCard key={item.id} item={item} dispatch={dispatch} />)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
