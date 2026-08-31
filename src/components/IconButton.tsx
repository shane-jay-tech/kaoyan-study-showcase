import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonTone = 'default' | 'primary' | 'quiet';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visible to screen readers and used as the native tooltip. */
  label: string;
  icon: ReactNode;
  tone?: IconButtonTone;
  size?: 'md' | 'lg';
}

/**
 * A 44px+ touch target icon button with an accessible label and tooltip.
 * All buttons render with a stable control height so layouts do not shift.
 */
export function IconButton({
  label,
  icon,
  tone = 'default',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`icon-button icon-button--${tone} icon-button--${size} ${className}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  );
}
