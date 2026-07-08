import type { HTMLAttributes, ReactNode } from "react";

export type MetricTrend = "up" | "down" | "neutral";

export type MetricCardVariant = "default" | "outline";

export interface MetricCardClassNames {
  root?: string;
  icon?: string;
  label?: string;
  value?: string;
  description?: string;
  trend?: string;
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label shown above the value */
  label: string;
  /** The primary metric value */
  value: string | number;
  /** Optional icon displayed alongside the label */
  icon?: ReactNode;
  /** Subtitle or description below the value */
  description?: string;
  /** Visual variant. "outline" renders a no-fill, bordered card with chevron trend icons and no +/- prefix */
  variant?: MetricCardVariant;
  /** Direction of the trend indicator */
  trend?: MetricTrend;
  /** Formatted trend text (e.g. "+12.5%") */
  trendValue?: string;
  /** Enable count-up animation from 0 to the target value on mount and value change */
  animate?: boolean;
  /** Duration of the count-up animation in ms (default: 1500) */
  animationDuration?: number;
  classNames?: MetricCardClassNames;
  className?: string;
}
