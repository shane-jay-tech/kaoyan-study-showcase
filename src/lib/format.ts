export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
}

/**
 * Formats a value as a percent string. Values in (0, 1] are treated as a
 * ratio and scaled to a percentage (0.5 -> "50%"); larger values are
 * already percentages (88 -> "88%").
 */
export function formatPercent(value: number): string {
  const percent = value > 0 && value <= 1 ? value * 100 : value;
  return `${Math.round(percent)}%`;
}

export function initials(value: string): string {
  return value.trim().slice(0, 1) || '学';
}

/** Human-readable file size, e.g. 1_234_567 -> "1.2 MB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let i = 1; i < units.length && value >= 1024; i += 1) {
    value /= 1024;
    unit = units[i];
  }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/**
 * Whole calendar days from `fromISO` (defaults to today) until `isoDate`.
 * Both dates are interpreted as UTC midnights so the result is exact and
 * timezone-independent. Never returns a negative value.
 */
export function daysUntil(isoDate: string, fromISO?: string): number {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  const start = fromISO ? Date.parse(`${fromISO}T00:00:00Z`) : startOfTodayUtcMs();
  const diff = Math.round((target - start) / 86_400_000);
  return Math.max(0, diff);
}

function startOfTodayUtcMs(): number {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}
